import { updateReportSchema } from '../../../../../shared/validation/reportSchemas'
import type { Report } from '../../domain/entities/Report'
import type { ReportRepository } from '../../domain/repositories/ReportRepository'
import { ReportNotFoundError, UnauthorizedReportAccessError, DuplicateReportError } from '../../domain/errors/ReportErrors'

export async function updateReport(
  reportId: string,
  input: unknown,
  repository: ReportRepository,
  userId: string
): Promise<Report> {
  // Validate input
  const validated = updateReportSchema.parse(input)
  
  // Find existing report
  const report = await repository.findById(reportId, userId)
  if (!report) {
    throw new ReportNotFoundError(reportId)
  }
  
  // Check authorization
  if (!report.canBeUpdatedBy(userId)) {
    throw new UnauthorizedReportAccessError()
  }
  
  // If updating period, check for duplicates
  if (validated.month !== undefined && validated.year !== undefined) {
    const existingReport = await repository.findByPeriod(userId, validated.month, validated.year)
    if (existingReport && existingReport.id !== reportId) {
      throw new DuplicateReportError(validated.month, validated.year)
    }
    
    // Update period
    report.updatePeriod(validated.month, validated.year)
  }
  
  // Update data
  const updateData: any = {}
  if (validated.studies !== undefined) updateData.studies = validated.studies
  if (validated.ministryHours !== undefined) updateData.ministryHours = validated.ministryHours
  if (validated.creditHours !== undefined) updateData.creditHours = validated.creditHours
  
  if (Object.keys(updateData).length > 0) {
    report.updateReportData(updateData)
  }
  
  // Save through repository
  return await repository.update(report)
}