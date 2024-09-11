import { client, db } from '.'
import { goals, golasCompletions } from './schema'
import dayjs from 'dayjs'

async function seed() {
  await db.delete(golasCompletions)
  await db.delete(goals)

  const result = await db
    .insert(goals)
    .values([
      { title: 'Acordar Cedo', desiredWeekllyFrequency: 5 },
      { title: 'Me Exercitar', desiredWeekllyFrequency: 3 },
      { title: 'Meditar', desiredWeekllyFrequency: 1 },
    ])
    .returning()

  const startOfWeek = dayjs().startOf('week')

  await db.insert(golasCompletions).values([
    { goalId: result[0].id, createAt: startOfWeek.toDate() },
    { goalId: result[1].id, createAt: startOfWeek.add(1, 'day').toDate() },
  ])
}

seed().finally(() => {
  client.end()
})
