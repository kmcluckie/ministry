import type { PersonRepository } from '../../domain/repositories/PersonRepository'
import { PersonNotFoundError } from '../../domain/errors/PersonErrors'

export async function deletePerson(
  personId: string,
  repository: PersonRepository,
  userId: string
): Promise<void> {
  // Verify person exists and belongs to user
  const personExists = await repository.exists(personId, userId)
  if (!personExists) {
    throw new PersonNotFoundError(personId)
  }
  
  // Delete through repository (includes visits due to cascade)
  await repository.delete(personId, userId)
}