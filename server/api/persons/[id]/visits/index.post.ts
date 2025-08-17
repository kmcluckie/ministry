import { z } from 'zod'
import { createPersonDependencies } from '../../../../bounded-contexts/persons/infrastructure/dependencies'
import { PersonNotFoundError } from '../../../../bounded-contexts/persons/domain/errors/PersonErrors'
import { ValidationError, UnauthorizedError, BusinessRuleViolationError } from '../../../../bounded-contexts/shared/domain/errors/DomainError'

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
    
    // Return visit DTO with camelCase fields
    return {
      id: newVisit.id,
      personId: person.id,
      visitedAt: newVisit.visitedAt,
      notes: newVisit.notes,
      createdAt: newVisit.createdAt
    }
  } catch (error) {
    // Handle validation errors
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
    if (error instanceof PersonNotFoundError) {
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