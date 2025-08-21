import { createTimeDependencies } from '../../bounded-contexts/time/infrastructure/dependencies'
import { defineApiHandler } from '../../utils/api-error-handler'
import { formatTimeResponse } from '../../utils/api-response-formatters'

export default defineApiHandler(async (event) => {
  // Get dependencies with injected services
  const deps = await createTimeDependencies(event)
  
  // Get time ID from route params
  const timeId = getRouterParam(event, 'id')!
  
  // Use the getTime use case
  const time = await deps.getTime(timeId)
  
  // Return formatted DTO with camelCase fields
  return formatTimeResponse(time)
})