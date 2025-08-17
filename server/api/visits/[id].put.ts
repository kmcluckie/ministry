import { createPersonDependencies } from '../../bounded-contexts/persons/infrastructure/dependencies'
import { defineApiHandler, validators } from '../../utils/api-error-handler'
import { formatVisitResponse, type PersonDomain, type VisitDomain } from '../../utils/api-response-formatters'

export default defineApiHandler(async (event) => {
  // Get dependencies
  const deps = await createPersonDependencies(event)
  
  // Get visit ID from route (validates automatically)
  const visitId = validators.visitId(event)

  // Get request body
  const body = await readBody(event)
  
  // Find the person that owns this visit
  // Note: In a production system, you might want to optimize this by adding a direct lookup
  // or caching, but for now we'll iterate through all persons to find the visit owner
  const allPersons = await deps.listPersons({})
  let personWithVisit: PersonDomain | null = null
  
  for (const person of allPersons) {
    if (person.visits.some((v: { id: string }) => v.id === visitId)) {
      personWithVisit = person as PersonDomain
      break
    }
  }
  
  if (!personWithVisit) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Visit not found'
    })
  }
  
  // Use the updateVisit use case
  const updatedPerson = await deps.updateVisit(personWithVisit.id, visitId, body)
  
  // Find the updated visit
  const updatedVisit = (updatedPerson as PersonDomain).visits.find((v: { id: string }) => v.id === visitId)
  
  if (!updatedVisit) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update visit'
    })
  }
  
  // Return formatted visit DTO with camelCase fields
  return formatVisitResponse(updatedVisit as VisitDomain, (updatedPerson as PersonDomain).id)
})