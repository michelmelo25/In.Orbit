import { db } from '../db'
import { goals } from '../db/schema'

interface CreateGoalRequest {
  title: string
  desiredWeekllyFrequency: number
}

export async function createGoal({
  title,
  desiredWeekllyFrequency,
}: CreateGoalRequest) {
  const result = await db
    .insert(goals)
    .values({
      title,
      desiredWeekllyFrequency,
    })
    .returning()

  const goal = result[0]

  return {
    goal,
  }
}
