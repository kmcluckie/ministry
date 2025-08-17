import type { Person } from '../../domain/entities/Person'
import type { PersonRepository } from '../../domain/repositories/PersonRepository'
import { PersonNotFoundError } from '../../domain/errors/PersonErrors'
import { recordVisitSchema } from '../../../../../shared/validation/personSchemas'

export async function recordVisit(
  personId: string,
  input: unknown,
  repository: PersonRepository,
  userId: string
): Promise<Person> {
  // Validate input
  const validated = recordVisitSchema.parse(input)
  
  // Get person aggregate
  const person = await repository.findById(personId, userId)
  if (!person) {
    throw new PersonNotFoundError(personId)
  }
  
  // Add visit through aggregate (enforces business rules)
  person.addVisit(new Date(validated.visitedAt), validated.notes ?? undefined)
  
  // Save through repository
  return await repository.save(person)
}