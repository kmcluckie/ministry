import type { Person } from '../../domain/entities/Person'
import type { PersonRepository } from '../../domain/repositories/PersonRepository'
import { PersonNotFoundError } from '../../domain/errors/PersonErrors'

export async function getPerson(
  personId: string,
  repository: PersonRepository,
  userId: string
): Promise<Person> {
  const person = await repository.findById(personId, userId)
  
  if (!person) {
    throw new PersonNotFoundError(personId)
  }
  
  return person
}