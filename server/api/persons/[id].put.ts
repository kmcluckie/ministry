import { createPersonDependencies } from '../../bounded-contexts/persons/infrastructure/dependencies'
import { defineApiHandler, validators } from '../../utils/api-error-handler'
import { formatPersonResponse } from '../../utils/api-response-formatters'

export default defineApiHandler(async (event) => {
  // Get dependencies
  const deps = await createPersonDependencies(event)
  
  // Get person ID from route (validates automatically)
  const id = validators.personId(event)

  // Get request body
  const body = await readBody(event)
  
  // Use the updatePerson use case
  const person = await deps.updatePerson(id, body)
  
  // Return formatted DTO with camelCase fields
  return formatPersonResponse(person)
})