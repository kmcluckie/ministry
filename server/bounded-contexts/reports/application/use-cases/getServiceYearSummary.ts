import type { ReportRepository } from '../../domain/repositories/ReportRepository'

export async function getServiceYearSummary(
  serviceYear: number,
  repository: ReportRepository,
  userId: string
): Promise<{
  totalStudies: number
  totalMinistryHours: number
  totalCreditHours: number
  totalHours: number
  monthsReported: number
  averageStudiesPerMonth: number
  averageHoursPerMonth: number
  reports: any[] // Will be converted to DTOs by the API layer
}> {
  return await repository.getServiceYearSummary(userId, serviceYear)
}