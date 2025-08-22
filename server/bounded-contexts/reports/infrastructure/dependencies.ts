import { SupabaseReportRepository } from './repositories/SupabaseReportRepository'
import { SupabaseTimeRepository } from '../../time/infrastructure/repositories/SupabaseTimeRepository'
import { getAuthUser } from '../../shared/infrastructure/auth/getAuthUser'
import { createReport } from '../application/use-cases/createReport'
import { listReports } from '../application/use-cases/listReports'
import { getReport } from '../application/use-cases/getReport'
import { updateReport } from '../application/use-cases/updateReport'
import { deleteReport } from '../application/use-cases/deleteReport'
import { getReportDefaults } from '../application/use-cases/getReportDefaults'
import { getServiceYearSummary } from '../application/use-cases/getServiceYearSummary'
import { serverSupabaseClient } from '#supabase/server'
import type { H3Event } from 'h3'

export async function createReportDependencies(event: H3Event) {
  // Get authenticated user
  const user = await getAuthUser(event)
  
  // Get Supabase client
  const client = await serverSupabaseClient(event)
  
  // Create repositories
  const reportRepository = new SupabaseReportRepository(client)
  const timeRepository = new SupabaseTimeRepository(client)
  
  // Return use cases with dependencies injected
  return {
    // Repositories (for direct access if needed)
    reportRepository,
    timeRepository,
    
    // Current user
    currentUser: user,
    
    // Use cases
    createReport: (input: unknown) => createReport(input, reportRepository, user.id),
    listReports: (input: unknown) => listReports(input, reportRepository, user.id),
    getReport: (reportId: string) => getReport(reportId, reportRepository, user.id),
    updateReport: (reportId: string, input: unknown) => updateReport(reportId, input, reportRepository, user.id),
    deleteReport: (reportId: string) => deleteReport(reportId, reportRepository, user.id),
    getReportDefaults: (input: unknown) => getReportDefaults(input, timeRepository, user.id),
    getServiceYearSummary: (serviceYear: number) => getServiceYearSummary(serviceYear, reportRepository, user.id)
  }
}