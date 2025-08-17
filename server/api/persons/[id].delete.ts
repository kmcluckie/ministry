import { createPersonDependencies } from '../../bounded-contexts/persons/infrastructure/dependencies'
import { defineApiHandler, validators, createSuccessResponse } from '../../utils/api-error-handler'

export default defineApiHandler(async (event) => {
  // Get dependencies
  const deps = await createPersonDependencies(event)
  
  // Get person ID from route (validates automatically)
  const id = validators.personId(event)

  // Use the deletePerson use case
  await deps.deletePerson(id)
  
  return createSuccessResponse()
})