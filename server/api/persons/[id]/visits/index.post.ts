import { createPersonDependencies } from '../../../../bounded-contexts/persons/infrastructure/dependencies'
import { defineApiHandler, validators } from '../../../../utils/api-error-handler'
import { formatVisitResponse } from '../../../../utils/api-response-formatters'

export default defineApiHandler(async (event) => {
  // Get dependencies
  const deps = await createPersonDependencies(event)
  
  // Get person ID from route (validates automatically)
  const personId = validators.personId(event)

  // Get request body
  const body = await readBody(event)
  
  // Use the recordVisit use case (validates through domain)
  const person = await deps.recordVisit(personId, body)
  
  // Get the newly added visit (last one)
  const newVisit = person.visits[person.visits.length - 1]
  
  if (!newVisit) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create visit'
    })
  }
  
  // Return formatted visit DTO with camelCase fields
  return formatVisitResponse(newVisit, person.id)
})