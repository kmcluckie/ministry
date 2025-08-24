import type { TimeRepository } from '../../domain/repositories/TimeRepository'
import { TimeNotFoundError, UnauthorizedTimeAccessError } from '../../domain/errors/TimeErrors'

export async function deleteTime(
  timeId: string,
  repository: TimeRepository,
  userId: string
): Promise<void> {
  // Find existing time to verify ownership
  const existingTime = await repository.findById(timeId, userId)
  
  if (!existingTime) {
    throw new TimeNotFoundError(timeId)
  }
  
  if (!existingTime.canBeDeletedBy(userId)) {
    throw new UnauthorizedTimeAccessError()
  }
  
  // Delete through repository
  await repository.delete(timeId, userId)
}