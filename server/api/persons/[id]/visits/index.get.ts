import { createPersonDependencies } from '../../../../bounded-contexts/persons/infrastructure/dependencies'
import { PersonNotFoundError } from '../../../../bounded-contexts/persons/domain/errors/PersonErrors'
import { UnauthorizedError } from '../../../../bounded-contexts/shared/domain/errors/DomainError'

export default defineEventHandler(async (event) => {
  try {
    // Get dependencies
    const deps = await createPersonDependencies(event)
    
    // Get person ID from route
    const personId = getRouterParam(event, 'id')
    
    if (!personId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Person ID is required'
      })
    }

    // Use the getPerson use case to get the person aggregate with visits
    const person = await deps.getPerson(personId)
    
    // Return visits in camelCase format, sorted by visit date (most recent first)
    return [...person.visits]
      .sort((a, b) => new Date(b.visitedAt).getTime() - new Date(a.visitedAt).getTime())
      .map(visit => ({
        id: visit.id,
        personId: person.id,
        visitedAt: visit.visitedAt,
        notes: visit.notes,
        createdAt: visit.createdAt
      }))
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