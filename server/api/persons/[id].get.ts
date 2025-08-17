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

    // Use the getPerson use case
    const person = await deps.getPerson(id)
    
    // Return DTO with visits in camelCase
    return {
      id: person.id,
      name: person.name,
      address: person.address,
      notes: person.notes,
      createdAt: person.createdAt,
      updatedAt: person.updatedAt,
      visits: person.visits.map(visit => ({
        id: visit.id,
        visitedAt: visit.visitedAt,
        notes: visit.notes,
        createdAt: visit.createdAt
      }))
    }
  } catch (error) {
    // Handle domain errors
    if (error instanceof PersonNotFoundError) {
      throw createError({
        statusCode: 404,
        statusMessage: error.message
      })
    }
    
    if (error instanceof UnauthorizedError) {
      throw createError({
        statusCode: 401,
        statusMessage: error.message
      })
    }
    
    throw error
  }
})