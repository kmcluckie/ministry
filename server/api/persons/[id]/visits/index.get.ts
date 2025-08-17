import { createPersonDependencies } from '../../../../bounded-contexts/persons/infrastructure/dependencies'
import { defineApiHandler, validators } from '../../../../utils/api-error-handler'
import { formatVisitsResponse } from '../../../../utils/api-response-formatters'

export default defineApiHandler(async (event) => {
  // Get dependencies
  const deps = await createPersonDependencies(event)
  
  // Get person ID from route (validates automatically)
  const personId = validators.personId(event)

  // Use the getPerson use case to get the person aggregate with visits
  const person = await deps.getPerson(personId)
  
  // Return formatted visits in camelCase, sorted by visit date (most recent first)
  return formatVisitsResponse(person.visits, person.id)
})