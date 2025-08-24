import { SupabasePersonRepository } from './repositories/SupabasePersonRepository'
import { getAuthUser } from '../../shared/infrastructure/auth/getAuthUser'
import { createPerson } from '../application/use-cases/createPerson'
import { updatePerson } from '../application/use-cases/updatePerson'
import { getPerson } from '../application/use-cases/getPerson'
import { listPersons } from '../application/use-cases/listPersons'
import { deletePerson } from '../application/use-cases/deletePerson'
import { recordVisit } from '../application/use-cases/recordVisit'
import { deleteVisit } from '../application/use-cases/deleteVisit'
import { updateVisit } from '../application/use-cases/updateVisit'
import { serverSupabaseClient } from '#supabase/server'
import type { H3Event } from 'h3'

export async function createPersonDependencies(event: H3Event) {
  // Get authenticated user
  const user = await getAuthUser(event)
  
  // Get Supabase client
  const client = await serverSupabaseClient(event)
  
  // Create repository
  const personRepository = new SupabasePersonRepository(client)
  
  // Return use cases with dependencies injected
  return {
    // Repository (for direct access if needed)
    personRepository,
    
    // Current user
    currentUser: user,
    
    // Use cases
    createPerson: (input: unknown) => 
      createPerson(input, personRepository, user.id),
    
    updatePerson: (personId: string, input: unknown) =>
      updatePerson(personId, input, personRepository, user.id),
    
    getPerson: (personId: string) =>
      getPerson(personId, personRepository, user.id),
    
    listPersons: (input: unknown = {}) =>
      listPersons(input, personRepository, user.id),
    
    deletePerson: (personId: string) =>
      deletePerson(personId, personRepository, user.id),
    
    recordVisit: (personId: string, input: unknown) =>
      recordVisit(personId, input, personRepository, user.id),
    
    deleteVisit: (personId: string, visitId: string) =>
      deleteVisit(personId, visitId, personRepository, user.id),
    
    updateVisit: (personId: string, visitId: string, input: unknown) =>
      updateVisit(personId, visitId, input, personRepository, user.id)
  }
}