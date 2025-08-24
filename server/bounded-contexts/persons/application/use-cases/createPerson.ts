import { Person } from '../../domain/entities/Person'
import type { PersonRepository } from '../../domain/repositories/PersonRepository'
import { createPersonSchema } from '../../../../../shared/validation/personSchemas'

export async function createPerson(
  input: unknown,
  repository: PersonRepository,
  userId: string
): Promise<Person> {
  // Validate input
  const validated = createPersonSchema.parse(input)
  
  // Create domain entity
  const person = Person.create({
    name: validated.name,
    address: validated.address,
    notes: validated.notes,
    userId
  })
  
  // Save through repository
  return await repository.save(person)
}