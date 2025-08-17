import { z } from 'zod'
import { createPersonDependencies } from '../../bounded-contexts/persons/infrastructure/dependencies'
import { PersonNotFoundError, VisitNotFoundError } from '../../bounded-contexts/persons/domain/errors/PersonErrors'
import { ValidationError, UnauthorizedError, BusinessRuleViolationError } from '../../bounded-contexts/shared/domain/errors/DomainError'

export default defineEventHandler(async (event) => {
  try {
    // Get dependencies
    const deps = await createPersonDependencies(event)
    
    // Get visit ID from route
    const visitId = getRouterParam(event, 'id')
    
    if (!visitId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Visit ID is required'
      })
    }

    // Get request body
    const body = await readBody(event)
    
    // Find the person that owns this visit
    // Note: In a production system, you might want to optimize this by adding a direct lookup
    // or caching, but for now we'll iterate through all persons to find the visit owner
    const allPersons = await deps.listPersons({})
    let personWithVisit: any = null
    
    for (const person of allPersons) {
      if (person.visits.some((v: any) => v.id === visitId)) {
        personWithVisit = person
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
    const updatedVisit = updatedPerson.visits.find(v => v.id === visitId)
    
    if (!updatedVisit) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update visit'
      })
    }
    
    // Return visit DTO with camelCase fields
    return {
      id: updatedVisit.id,
      personId: updatedPerson.id,
      visitedAt: updatedVisit.visitedAt,
      notes: updatedVisit.notes,
      createdAt: updatedVisit.createdAt
    }
  } catch (error) {
    // Handle validation errors from Zod
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: error.errors[0]?.message || 'Validation error'
      })
    }
    
    // Handle domain validation errors
    if (error instanceof ValidationError) {
      throw createError({
        statusCode: 400,
        statusMessage: error.message
      })
    }
    
    // Handle business rule violations (e.g., duplicate visit on same day)
    if (error instanceof BusinessRuleViolationError) {
      throw createError({
        statusCode: 409,
        statusMessage: error.message
      })
    }
    
    // Handle not found errors
    if (error instanceof PersonNotFoundError || error instanceof VisitNotFoundError) {
      throw createError({
        statusCode: 404,
        statusMessage: error.message
      })
    }
    
    // Handle auth errors
    if (error instanceof UnauthorizedError) {
      throw createError({
        statusCode: 401,
        statusMessage: error.message
      })
    }
    
    throw error
  }
})