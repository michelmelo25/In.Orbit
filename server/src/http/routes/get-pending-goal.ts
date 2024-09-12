import { z } from 'zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { getWeekPendingGoals } from '../../functions/get-week-pending-goals'

export const getPendingGoalsRoute: FastifyPluginAsyncZod = async app => {
  // console.log('Inicio get Pending')
  app.get('/pending-goals', async () => {
    // console.log('Consultando banco')
    const { pendingGoals } = await getWeekPendingGoals()
    // console.log('Retornando Pending')
    return { pendingGoals }
  })
}
