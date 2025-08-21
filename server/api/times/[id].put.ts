import { createTimeDependencies } from '../../bounded-contexts/time/infrastructure/dependencies'
import { defineApiHandler } from '../../utils/api-error-handler'
import { formatTimeResponse } from '../../utils/api-response-formatters'

export default defineApiHandler(async (event) => {
  // Get dependencies with injected services
  const deps = await createTimeDependencies(event)
  
  // Get time ID from route params
  const timeId = getRouterParam(event, 'id')!
  
  // Get request body
  const body = await readBody(event)
  
  // Use the updateTime use case
  const time = await deps.updateTime(timeId, body)
  
  // Return formatted DTO with camelCase fields
  return formatTimeResponse(time)
})