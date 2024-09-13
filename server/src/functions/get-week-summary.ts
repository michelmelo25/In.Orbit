import { and, count, eq, gte, lte, sql } from 'drizzle-orm'
import { db } from '../db'
import { goals, goalsCompletions } from '../db/schema'
import dayjs from 'dayjs'

export async function getWeekSumary() {
  const firstOfWeek = dayjs().startOf('week').toDate()
  const lastDayOfWeek = dayjs().endOf('week').toDate()

  const goalsCreatedUpToWeek = db.$with('goals_created_up_to_week').as(
    db
      .select({
        id: goals.id,
        title: goals.title,
        desiredWeekllyFrequency: goals.desiredWeekllyFrequency,
        createdAT: goals.createAt,
      })
      .from(goals)
      .where(lte(goals.createAt, lastDayOfWeek))
  )

  const goalCompletedInWeek = db.$with('goals_completed_in_week').as(
    db
      .select({
        id: goals.id,
        title: goals.title,
        completedAt: goalsCompletions.createAt,
        completedAtDate: sql /*sql*/`
        DATE(${goalsCompletions.createAt})
        `.as('completedAtDate'),
      })
      .from(goalsCompletions)
      .innerJoin(goals, eq(goals.id, goalsCompletions.goalId))
      .where(
        and(
          gte(goalsCompletions.createAt, firstOfWeek),
          lte(goalsCompletions.createAt, lastDayOfWeek)
        )
      )
  )

  const goalCompleteByWeekDay = db.$with('goals_completed_by_week_day').as(
    db
      .select({
        completedAtDate: goalCompletedInWeek.completedAtDate,
        completions: sql /*sql*/`
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'id', ${goalCompletedInWeek.id},
                'title', ${goalCompletedInWeek.title},
                'completedAt', ${goalCompletedInWeek.completedAt}
            )
        )
        `.as('completions'),
      })
      .from(goalCompletedInWeek)
      .groupBy(goalCompletedInWeek.completedAtDate)
  )

  const result = await db
    .with(goalsCreatedUpToWeek, goalCompletedInWeek, goalCompleteByWeekDay)
    .select({
      completed: sql /*sql*/`
      (SELECT COUNT(*) FROM ${goalCompletedInWeek})
      `.mapWith(Number),
      total:
        sql /*sql*/`(SELECT SUM(${goalsCreatedUpToWeek.desiredWeekllyFrequency}) FROM ${goalsCreatedUpToWeek})`.mapWith(
          Number
        ),
      goalsPerDay: sql /*sql*/`
        JSON_OBJECT_AGG(
          ${goalCompleteByWeekDay.completedAtDate},${goalCompleteByWeekDay.completions}
        )`,
    })
    .from(goalCompleteByWeekDay)

  return {
    summary: result,
  }
}
