import { createTimeDependencies } from '../../bounded-contexts/time/infrastructure/dependencies'
import { defineApiHandler } from '../../utils/api-error-handler'
import { formatTimeResponse } from '../../utils/api-response-formatters'

export default defineApiHandler(async (event) => {
  // Get dependencies with injected services
  const deps = await createTimeDependencies(event)
  
  // Get request body
  const body = await readBody(event)
  
  // Use the createTime use case
  const time = await deps.createTime(body)
  
  // Return formatted DTO with camelCase fields
  return formatTimeResponse(time)
})