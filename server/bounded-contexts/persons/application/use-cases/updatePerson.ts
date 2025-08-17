import type { Person } from '../../domain/entities/Person'
import type { PersonRepository } from '../../domain/repositories/PersonRepository'
import { PersonNotFoundError } from '../../domain/errors/PersonErrors'
import { updatePersonSchema } from '../../../../../shared/validation/personSchemas'

export async function updatePerson(
  personId: string,
  input: unknown,
  repository: PersonRepository,
  userId: string
): Promise<Person> {
  // Validate input
  const validated = updatePersonSchema.parse(input)
  
  // Get existing person
  const person = await repository.findById(personId, userId)
  if (!person) {
    throw new PersonNotFoundError(personId)
  }
  
  // Update domain entity
  if (validated.name !== person.name) {
    person.updateName(validated.name)
  }
  
  if (validated.address !== person.address) {
    person.updateAddress(validated.address ?? null)
  }
  
  if (validated.notes !== person.notes) {
    person.updateNotes(validated.notes ?? null)
  }
  
  // Save through repository
  return await repository.save(person)
}