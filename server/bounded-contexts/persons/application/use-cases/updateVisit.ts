import type { Person } from '../../domain/entities/Person'
import type { PersonRepository } from '../../domain/repositories/PersonRepository'
import { PersonNotFoundError, VisitNotFoundError } from '../../domain/errors/PersonErrors'
import { visitFormSchema } from '../../../../../shared/validation/personSchemas'

export async function updateVisit(
  personId: string,
  visitId: string,
  input: unknown,
  repository: PersonRepository,
  userId: string
): Promise<Person> {
  // Validate input
  const validated = visitFormSchema.parse(input)
  
  // Get person aggregate
  const person = await repository.findById(personId, userId)
  if (!person) {
    throw new PersonNotFoundError(personId)
  }
  
  // Verify visit exists
  const visitExists = person.visits.some(v => v.id === visitId)
  if (!visitExists) {
    throw new VisitNotFoundError(visitId)
  }
  
  // Update visit through aggregate
  person.updateVisit(
    visitId,
    new Date(validated.visitedAt),
    validated.notes
  )
  
  // Save through repository
  return await repository.save(person)
}