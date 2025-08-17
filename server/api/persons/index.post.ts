import { z } from 'zod'
import { createPersonDependencies } from '../../bounded-contexts/persons/infrastructure/dependencies'
import { ValidationError, UnauthorizedError } from '../../bounded-contexts/shared/domain/errors/DomainError'

export default defineEventHandler(async (event) => {
  try {
    // Get dependencies with injected services
    const deps = await createPersonDependencies(event)
    
    // Get request body
    const body = await readBody(event)
    
    // Use the createPerson use case
    const person = await deps.createPerson(body)
    
    // Return DTO with camelCase fields
    return {
      id: person.id,
      name: person.name,
      address: person.address,
      notes: person.notes,
      createdAt: person.createdAt,
      updatedAt: person.updatedAt
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