import type { Person } from '../../domain/entities/Person'
import type { PersonRepository } from '../../domain/repositories/PersonRepository'
import { listPersonsSchema } from '../../../../../shared/validation/personSchemas'

export async function listPersons(
  input: unknown,
  repository: PersonRepository,
  userId: string
): Promise<Person[]> {
  // Validate input (query parameters)
  const validated = listPersonsSchema.parse(input)
  
  return await repository.findByUserId(userId, {
    search: validated.search,
    limit: validated.limit,
    offset: validated.offset
  })
}