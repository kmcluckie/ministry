import { createReportDependencies } from '../../bounded-contexts/reports/infrastructure/dependencies'
import { defineApiHandler, validators } from '../../utils/api-error-handler'
import { formatReportResponse } from '../../utils/api-response-formatters'

export default defineApiHandler(async (event) => {
  // Get dependencies with injected services
  const deps = await createReportDependencies(event)
  
  // Validate and get report ID from route parameters
  const reportId = validators.reportId(event)
  
  // Get request body
  const body = await readBody(event)
  
  // Use the updateReport use case
  const report = await deps.updateReport(reportId, body)
  
  // Return formatted DTO with camelCase fields
  return formatReportResponse(report)
})