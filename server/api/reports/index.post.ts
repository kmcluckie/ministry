import { createReportDependencies } from '../../bounded-contexts/reports/infrastructure/dependencies'
import { defineApiHandler } from '../../utils/api-error-handler'
import { formatReportResponse } from '../../utils/api-response-formatters'

export default defineApiHandler(async (event) => {
  // Get dependencies with injected services
  const deps = await createReportDependencies(event)
  
  // Get request body
  const body = await readBody(event)
  
  // Use the createReport use case
  const report = await deps.createReport(body)
  
  // Return formatted DTO with camelCase fields
  return formatReportResponse(report)
})