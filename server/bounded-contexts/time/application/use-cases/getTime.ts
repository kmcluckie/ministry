import type { Time } from '../../domain/entities/Time'
import type { TimeRepository } from '../../domain/repositories/TimeRepository'
import { TimeNotFoundError } from '../../domain/errors/TimeErrors'

export async function getTime(
  timeId: string,
  repository: TimeRepository,
  userId: string
): Promise<Time> {
  const time = await repository.findById(timeId, userId)
  
  if (!time) {
    throw new TimeNotFoundError(timeId)
  }
  
  return time
}