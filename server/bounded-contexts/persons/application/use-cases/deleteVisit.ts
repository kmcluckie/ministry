import type { Person } from '../../domain/entities/Person'
import type { PersonRepository } from '../../domain/repositories/PersonRepository'
import { PersonNotFoundError, VisitNotFoundError } from '../../domain/errors/PersonErrors'

export async function deleteVisit(
  personId: string,
  visitId: string,
  repository: PersonRepository,
  userId: string
): Promise<Person> {
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
  
  // Remove visit through aggregate
  person.removeVisit(visitId)
  
  // Save through repository
  return await repository.save(person)
}