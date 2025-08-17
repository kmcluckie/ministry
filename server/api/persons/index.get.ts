import { createPersonDependencies } from '../../bounded-contexts/persons/infrastructure/dependencies'
import { defineApiHandler } from '../../utils/api-error-handler'
import { formatArrayResponse, formatPersonWithVisitCount } from '../../utils/api-response-formatters'

export default defineApiHandler(async (event) => {
  // Get dependencies
  const deps = await createPersonDependencies(event)
  
  // Get query parameters
  const query = getQuery(event)
  
  // Use the listPersons use case
  const persons = await deps.listPersons(query)
  
  // Return formatted DTOs with visit counts in camelCase
  return formatArrayResponse(persons, formatPersonWithVisitCount)
})