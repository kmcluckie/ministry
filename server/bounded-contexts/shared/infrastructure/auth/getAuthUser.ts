import { UnauthorizedError } from '../../domain/errors/DomainError'
import { serverSupabaseUser } from '#supabase/server'
import type { H3Event } from 'h3'

export async function getAuthUser(event: H3Event) {
  const user = await serverSupabaseUser(event)
  
  if (!user) {
    throw new UnauthorizedError('User not authenticated')
  }
  
  return user
}