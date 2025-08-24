import { createReportSchema } from '../../../../../shared/validation/reportSchemas'
import { Report } from '../../domain/entities/Report'
import type { ReportRepository } from '../../domain/repositories/ReportRepository'
import { DuplicateReportError } from '../../domain/errors/ReportErrors'

export async function createReport(
  input: unknown,
  repository: ReportRepository,
  userId: string
): Promise<Report> {
  // Validate input
  const validated = createReportSchema.parse(input)
  
  // Check if report already exists for this period
  const existingReport = await repository.findByPeriod(userId, validated.month, validated.year)
  if (existingReport) {
    throw new DuplicateReportError(validated.month, validated.year)
  }
  
  // Create domain entity
  const report = Report.create({
    month: validated.month,
    year: validated.year,
    studies: validated.studies,
    ministryHours: validated.ministryHours,
    creditHours: validated.creditHours,
    userId
  })
  
  // Save through repository
  return await repository.save(report)
}