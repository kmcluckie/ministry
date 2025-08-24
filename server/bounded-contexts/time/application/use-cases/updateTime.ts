import { updateTimeSchema } from '../../../../../shared/validation/timeSchemas'
import type { Time } from '../../domain/entities/Time'
import type { TimeRepository } from '../../domain/repositories/TimeRepository'
import { TimeNotFoundError, UnauthorizedTimeAccessError } from '../../domain/errors/TimeErrors'

export async function updateTime(
  timeId: string,
  input: unknown,
  repository: TimeRepository,
  userId: string
): Promise<Time> {
  // Validate input
  const validated = updateTimeSchema.parse(input)
  
  // Find existing time
  const existingTime = await repository.findById(timeId, userId)
  
  if (!existingTime) {
    throw new TimeNotFoundError(timeId)
  }
  
  if (!existingTime.canBeUpdatedBy(userId)) {
    throw new UnauthorizedTimeAccessError()
  }
  
  // Update the time entity
  if (validated.type !== undefined) {
    existingTime.updateType(validated.type)
  }
  
  if (validated.recordedOn !== undefined) {
    existingTime.updateRecordedOn(new Date(validated.recordedOn))
  }
  
  if (validated.hours !== undefined && validated.minutes !== undefined) {
    existingTime.updateTime(validated.hours, validated.minutes)
  }
  
  // Save through repository
  return await repository.update(existingTime)
}