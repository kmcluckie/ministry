import type { Report } from '../../domain/entities/Report'
import type { ReportRepository } from '../../domain/repositories/ReportRepository'
import { ReportNotFoundError } from '../../domain/errors/ReportErrors'

export async function getReport(
  reportId: string,
  repository: ReportRepository,
  userId: string
): Promise<Report> {
  const report = await repository.findById(reportId, userId)
  
  if (!report) {
    throw new ReportNotFoundError(reportId)
  }
  
  return report
}