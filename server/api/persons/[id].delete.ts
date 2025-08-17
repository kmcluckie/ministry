import { createPersonDependencies } from '../../bounded-contexts/persons/infrastructure/dependencies'
import { PersonNotFoundError } from '../../bounded-contexts/persons/domain/errors/PersonErrors'
import { UnauthorizedError } from '../../bounded-contexts/shared/domain/errors/DomainError'

export default defineEventHandler(async (event) => {
  try {
    // Get dependencies
    const deps = await createPersonDependencies(event)
    
    // Get person ID from route
    const id = getRouterParam(event, 'id')
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Person ID is required'
      })
    }

    // Use the deletePerson use case
    await deps.deletePerson(id)
    
    return { success: true }
  } catch (error) {
    // Handle not found errors
    if (error instanceof PersonNotFoundError) {
      throw createError({
        statusCode: 404,
        statusMessage: error.message
      })
    }
    
    // Handle authentication errors
    if (error instanceof UnauthorizedError) {
      throw createError({
        statusCode: 401,
        statusMessage: error.message
      })
    }
    
    // Re-throw other errors
    throw error
  }
})