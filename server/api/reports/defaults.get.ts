import { createReportDependencies } from '../../bounded-contexts/reports/infrastructure/dependencies'
import { defineApiHandler } from '../../utils/api-error-handler'
import type { ReportDefaultsResponse } from '../../utils/api-response-formatters'

export default defineApiHandler(async (event) => {
  // Get dependencies with injected services
  const deps = await createReportDependencies(event)
  
  // Get query parameters
  const query = getQuery(event)
  
  // Parse query parameters for month/year
  const input = {
    month: Number(query.month),
    year: Number(query.year)
  }
  
  // Use the getReportDefaults use case
  const defaults = await deps.getReportDefaults(input)
  
  // Return formatted DTO with camelCase fields
  const response: ReportDefaultsResponse = {
    ministryHours: defaults.ministryHours,
    creditHours: defaults.creditHours
  }
  
  return response
})