import { SupabaseTimeRepository } from './repositories/SupabaseTimeRepository'
import { getAuthUser } from '../../shared/infrastructure/auth/getAuthUser'
import { createTime } from '../application/use-cases/createTime'
import { listTimes } from '../application/use-cases/listTimes'
import { getTime } from '../application/use-cases/getTime'
import { updateTime } from '../application/use-cases/updateTime'
import { deleteTime } from '../application/use-cases/deleteTime'
import { getTimeTypes } from '../application/use-cases/getTimeTypes'
import { serverSupabaseClient } from '#supabase/server'
import type { H3Event } from 'h3'

export async function createTimeDependencies(event: H3Event) {
  // Get authenticated user
  const user = await getAuthUser(event)
  
  // Get Supabase client
  const client = await serverSupabaseClient(event)
  
  // Create repository
  const timeRepository = new SupabaseTimeRepository(client)
  
  // Return use cases with dependencies injected
  return {
    // Repository (for direct access if needed)
    timeRepository,
    
    // Current user
    currentUser: user,
    
    // Use cases
    createTime: (input: unknown) => createTime(input, timeRepository, user.id),
    listTimes: (input: unknown) => listTimes(input, timeRepository, user.id),
    getTime: (timeId: string) => getTime(timeId, timeRepository, user.id),
    updateTime: (timeId: string, input: unknown) => updateTime(timeId, input, timeRepository, user.id),
    deleteTime: (timeId: string) => deleteTime(timeId, timeRepository, user.id),
    getTimeTypes: () => getTimeTypes(timeRepository, user.id)
  }
}