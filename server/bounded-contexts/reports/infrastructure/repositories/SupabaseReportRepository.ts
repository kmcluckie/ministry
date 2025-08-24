import type { SupabaseClient } from '@supabase/supabase-js'
import { Report } from '../../domain/entities/Report'
import type { ReportRepository } from '../../domain/repositories/ReportRepository'
import { ReportNotFoundError } from '../../domain/errors/ReportErrors'

type DatabaseReportRecord = {
  id: string
  user_id: string
  month: number
  year: number
  studies: number
  ministry_hours: number
  credit_hours: number
  created_at: string
  updated_at: string
}

export class SupabaseReportRepository implements ReportRepository {
  constructor(private supabase: SupabaseClient) {}

  async save(report: Report): Promise<Report> {
    const { data, error } = await this.supabase
      .from('reports')
      .insert({
        id: report.id,
        user_id: report.userId,
        month: report.month,
        year: report.year,
        studies: report.studies,
        ministry_hours: report.ministryHours,
        credit_hours: report.creditHours,
        created_at: report.createdAt.toISOString(),
        updated_at: report.updatedAt.toISOString()
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to save report: ${error.message}`)
    }

    return this.mapToEntity(data)
  }

  async findById(id: string, userId: string): Promise<Report | null> {
    const { data, error } = await this.supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null
      }
      throw new Error(`Failed to find report: ${error.message}`)
    }

    return this.mapToEntity(data)
  }

  async findByUserId(userId: string, options?: {
    limit?: number
    offset?: number
    month?: { year: number, month: number }
    serviceYear?: number
  }): Promise<Report[]> {
    let query = this.supabase
      .from('reports')
      .select('*')
      .eq('user_id', userId)

    // Apply month filter
    if (options?.month) {
      query = query
        .eq('year', options.month.year)
        .eq('month', options.month.month)
    }

    // Apply service year filter (September 1 to August 31)
    if (options?.serviceYear) {
      // Service year runs from September of previous year to August of service year
      query = query.or(
        `and(year.eq.${options.serviceYear - 1},month.gte.9),and(year.eq.${options.serviceYear},month.lte.8)`
      )
    }

    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    if (options?.offset) {
      query = query.range(options.offset, (options.offset + (options?.limit || 50)) - 1)
    }

    // Order by year and month descending (most recent first)
    query = query.order('year', { ascending: false }).order('month', { ascending: false })

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to find reports: ${error.message}`)
    }

    return data.map(record => this.mapToEntity(record))
  }

  async findByPeriod(userId: string, month: number, year: number): Promise<Report | null> {
    const { data, error } = await this.supabase
      .from('reports')
      .select('*')
      .eq('user_id', userId)
      .eq('month', month)
      .eq('year', year)
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null
      }
      throw new Error(`Failed to find report by period: ${error.message}`)
    }

    return this.mapToEntity(data)
  }

  async update(report: Report): Promise<Report> {
    const { data, error } = await this.supabase
      .from('reports')
      .update({
        month: report.month,
        year: report.year,
        studies: report.studies,
        ministry_hours: report.ministryHours,
        credit_hours: report.creditHours,
        updated_at: report.updatedAt.toISOString()
      })
      .eq('id', report.id)
      .eq('user_id', report.userId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new ReportNotFoundError(report.id)
      }
      throw new Error(`Failed to update report: ${error.message}`)
    }

    return this.mapToEntity(data)
  }

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('reports')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to delete report: ${error.message}`)
    }
  }

  async getServiceYearSummary(userId: string, serviceYear: number): Promise<{
    totalStudies: number
    totalMinistryHours: number
    totalCreditHours: number
    totalHours: number
    monthsReported: number
    averageStudiesPerMonth: number
    averageHoursPerMonth: number
    reports: Report[]
  }> {
    // Get all reports for the service year
    const reports = await this.findByUserId(userId, { serviceYear })
    
    // Calculate totals
    const totalStudies = reports.reduce((sum, report) => sum + report.studies, 0)
    const totalMinistryHours = reports.reduce((sum, report) => sum + report.ministryHours, 0)
    const totalCreditHours = reports.reduce((sum, report) => sum + report.creditHours, 0)
    const totalHours = totalMinistryHours + totalCreditHours
    const monthsReported = reports.length
    
    // Calculate averages
    const averageStudiesPerMonth = monthsReported > 0 ? Math.round((totalStudies / monthsReported) * 100) / 100 : 0
    const averageHoursPerMonth = monthsReported > 0 ? Math.round((totalHours / monthsReported) * 100) / 100 : 0
    
    return {
      totalStudies,
      totalMinistryHours,
      totalCreditHours,
      totalHours,
      monthsReported,
      averageStudiesPerMonth,
      averageHoursPerMonth,
      reports
    }
  }

  private mapToEntity(data: DatabaseReportRecord): Report {
    return new Report(
      data.id,
      data.month,
      data.year,
      data.studies,
      data.ministry_hours,
      data.credit_hours,
      data.user_id,
      new Date(data.created_at),
      new Date(data.updated_at)
    )
  }
}