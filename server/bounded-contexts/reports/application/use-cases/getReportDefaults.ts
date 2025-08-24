import { reportDefaultsSchema } from '../../../../../shared/validation/reportSchemas'
import type { TimeRepository } from '../../../time/domain/repositories/TimeRepository'

export async function getReportDefaults(
  input: unknown,
  timeRepository: TimeRepository,
  userId: string
): Promise<{
  ministryHours: number
  creditHours: number
}> {
  // Validate input
  const validated = reportDefaultsSchema.parse(input)
  
  // Get time records for the specified month/year
  const timeRecords = await timeRepository.findByUserId(userId, {
    month: {
      year: validated.year,
      month: validated.month
    }
  })
  
  // Calculate total hours by type
  let ministryHours = 0
  let creditHours = 0
  
  for (const record of timeRecords) {
    const totalMinutes = record.getTotalMinutes()
    const hours = Math.floor(totalMinutes / 60)
    
    // Categorize by type - this logic may need to be adjusted based on your type conventions
    // For now, assume "Credit" types are credit hours, everything else is ministry hours
    if (record.type.toLowerCase().includes('credit')) {
      creditHours += hours
    } else {
      ministryHours += hours
    }
  }
  
  return {
    ministryHours,
    creditHours
  }
}