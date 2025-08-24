import { listTimesSchema } from '../../../../../shared/validation/timeSchemas'
import type { Time } from '../../domain/entities/Time'
import type { TimeRepository } from '../../domain/repositories/TimeRepository'

export async function listTimes(
  input: unknown,
  repository: TimeRepository,
  userId: string
): Promise<Time[]> {
  // Validate input
  const validated = listTimesSchema.parse(input || {})
  
  // Prepare repository options
  const options: Parameters<TimeRepository['findByUserId']>[1] = {}
  
  if (validated.limit !== undefined) {
    options.limit = validated.limit
  }
  
  if (validated.offset !== undefined) {
    options.offset = validated.offset
  }
  
  if (validated.type && validated.type.length > 0) {
    options.type = validated.type
  }
  
  if (validated.month) {
    options.month = validated.month
  }
  
  if (validated.serviceYear) {
    options.serviceYear = validated.serviceYear
  }
  
  // Get times through repository
  return await repository.findByUserId(userId, options)
}