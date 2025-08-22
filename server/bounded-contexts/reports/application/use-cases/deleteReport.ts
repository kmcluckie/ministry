import type { ReportRepository } from '../../domain/repositories/ReportRepository'
import { ReportNotFoundError, UnauthorizedReportAccessError } from '../../domain/errors/ReportErrors'

export async function deleteReport(
  reportId: string,
  repository: ReportRepository,
  userId: string
): Promise<void> {
  // Find existing report to check ownership
  const report = await repository.findById(reportId, userId)
  if (!report) {
    throw new ReportNotFoundError(reportId)
  }
  
  // Check authorization
  if (!report.canBeDeletedBy(userId)) {
    throw new UnauthorizedReportAccessError()
  }
  
  // Delete through repository
  await repository.delete(reportId, userId)
}