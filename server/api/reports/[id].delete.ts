import { createReportDependencies } from '../../bounded-contexts/reports/infrastructure/dependencies'
import { defineApiHandler, validators, createSuccessResponse } from '../../utils/api-error-handler'

export default defineApiHandler(async (event) => {
  // Get dependencies with injected services
  const deps = await createReportDependencies(event)
  
  // Validate and get report ID from route parameters
  const reportId = validators.reportId(event)
  
  // Use the deleteReport use case
  await deps.deleteReport(reportId)
  
  // Return success response
  return createSuccessResponse()
})