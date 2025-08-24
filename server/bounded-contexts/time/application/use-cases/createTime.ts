import { createTimeSchema } from '../../../../../shared/validation/timeSchemas'
import { Time } from '../../domain/entities/Time'
import type { TimeRepository } from '../../domain/repositories/TimeRepository'

export async function createTime(
  input: unknown,
  repository: TimeRepository,
  userId: string
): Promise<Time> {
  // Validate input
  const validated = createTimeSchema.parse(input)
  
  // Create domain entity
  const time = Time.create({
    type: validated.type,
    recordedOn: new Date(validated.recordedOn),
    hours: validated.hours,
    minutes: validated.minutes,
    userId
  })
  
  // Save through repository
  return await repository.save(time)
}