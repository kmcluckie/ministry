import { createTimeDependencies } from '../../bounded-contexts/time/infrastructure/dependencies'
import { defineApiHandler } from '../../utils/api-error-handler'

export default defineApiHandler(async (event) => {
  // Get dependencies with injected services
  const deps = await createTimeDependencies(event)
  
  // Get time ID from route params
  const timeId = getRouterParam(event, 'id')!
  
  // Use the deleteTime use case
  await deps.deleteTime(timeId)
  
  // Return success response
  return { success: true }
})