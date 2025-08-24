import { createReportDependencies } from '../../bounded-contexts/reports/infrastructure/dependencies'
import { defineApiHandler, validators } from '../../utils/api-error-handler'
import { formatReportResponse } from '../../utils/api-response-formatters'

export default defineApiHandler(async (event) => {
  // Get dependencies with injected services
  const deps = await createReportDependencies(event)
  
  // Validate and get report ID from route parameters
  const reportId = validators.reportId(event)
  
  // Use the getReport use case
  const report = await deps.getReport(reportId)
  
  // Return formatted DTO with camelCase fields
  return formatReportResponse(report)
})