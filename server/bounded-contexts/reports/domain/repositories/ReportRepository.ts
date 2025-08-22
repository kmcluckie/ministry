import type { Report } from '../entities/Report'

export interface ReportRepository {
  save(report: Report): Promise<Report>
  findById(id: string, userId: string): Promise<Report | null>
  findByUserId(userId: string, options?: {
    limit?: number
    offset?: number
    month?: { year: number, month: number }
    serviceYear?: number
  }): Promise<Report[]>
  findByPeriod(userId: string, month: number, year: number): Promise<Report | null>
  update(report: Report): Promise<Report>
  delete(id: string, userId: string): Promise<void>
  getServiceYearSummary(userId: string, serviceYear: number): Promise<{
    totalStudies: number
    totalMinistryHours: number
    totalCreditHours: number
    totalHours: number
    monthsReported: number
    averageStudiesPerMonth: number
    averageHoursPerMonth: number
    reports: Report[]
  }>
}