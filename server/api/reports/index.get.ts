import { createReportDependencies } from '../../bounded-contexts/reports/infrastructure/dependencies'
import { defineApiHandler } from '../../utils/api-error-handler'
import { formatReportResponse, formatArrayResponse } from '../../utils/api-response-formatters'

export default defineApiHandler(async (event) => {
  // Get dependencies with injected services
  const deps = await createReportDependencies(event)
  
  // Get query parameters
  const query = getQuery(event)
  
  // Parse query parameters for filtering
  const input = {
    limit: query.limit ? Number(query.limit) : undefined,
    offset: query.offset ? Number(query.offset) : undefined,
    month: query.month && query.year ? {
      year: Number(query.year),
      month: Number(query.month)
    } : undefined,
    serviceYear: query.serviceYear ? Number(query.serviceYear) : undefined
  }
  
  // Use the listReports use case
  const reports = await deps.listReports(input)
  
  // Return formatted DTOs with camelCase fields
  return formatArrayResponse(reports, formatReportResponse)
})