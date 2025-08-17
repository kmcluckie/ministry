import { createPersonDependencies } from '../../bounded-contexts/persons/infrastructure/dependencies'
import { defineApiHandler, validators } from '../../utils/api-error-handler'
import { formatPersonWithVisits } from '../../utils/api-response-formatters'

export default defineApiHandler(async (event) => {
  // Get dependencies
  const deps = await createPersonDependencies(event)
  
  // Get person ID from route (validates automatically)
  const id = validators.personId(event)

  // Use the getPerson use case
  const person = await deps.getPerson(id)
  
  // Return formatted DTO with visits in camelCase
  return formatPersonWithVisits(person)
})