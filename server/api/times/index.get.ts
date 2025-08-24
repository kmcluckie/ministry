import { createTimeDependencies } from '../../bounded-contexts/time/infrastructure/dependencies'
import { defineApiHandler } from '../../utils/api-error-handler'
import { formatTimeResponse, formatArrayResponse } from '../../utils/api-response-formatters'

export default defineApiHandler(async (event) => {
  // Get dependencies with injected services
  const deps = await createTimeDependencies(event)
  
  // Get query parameters
  const query = getQuery(event)
  
  // Parse query parameters for filtering
  const input = {
    limit: query.limit ? Number(query.limit) : undefined,
    offset: query.offset ? Number(query.offset) : undefined,
    type: query.type ? (Array.isArray(query.type) ? query.type : [query.type]) : undefined,
    month: query.month && query.year ? {
      year: Number(query.year),
      month: Number(query.month)
    } : undefined,
    serviceYear: query.serviceYear ? Number(query.serviceYear) : undefined
  }
  
  // Use the listTimes use case
  const times = await deps.listTimes(input)
  
  // Return formatted DTOs with camelCase fields
  return formatArrayResponse(times, formatTimeResponse)
})