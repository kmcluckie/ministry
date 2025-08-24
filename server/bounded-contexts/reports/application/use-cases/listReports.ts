import { listReportsSchema } from '../../../../../shared/validation/reportSchemas'
import type { Report } from '../../domain/entities/Report'
import type { ReportRepository } from '../../domain/repositories/ReportRepository'

export async function listReports(
  input: unknown,
  repository: ReportRepository,
  userId: string
): Promise<Report[]> {
  // Validate input
  const validated = listReportsSchema.parse(input)
  
  // Get reports through repository
  return await repository.findByUserId(userId, {
    limit: validated.limit,
    offset: validated.offset,
    month: validated.month,
    serviceYear: validated.serviceYear
  })
}