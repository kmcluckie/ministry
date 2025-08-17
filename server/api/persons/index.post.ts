import { createPersonDependencies } from '../../bounded-contexts/persons/infrastructure/dependencies'
import { defineApiHandler } from '../../utils/api-error-handler'
import { formatPersonResponse } from '../../utils/api-response-formatters'

export default defineApiHandler(async (event) => {
  // Get dependencies with injected services
  const deps = await createPersonDependencies(event)
  
  // Get request body
  const body = await readBody(event)
  
  // Use the createPerson use case
  const person = await deps.createPerson(body)
  
  // Return formatted DTO with camelCase fields
  return formatPersonResponse(person)
})