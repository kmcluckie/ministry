import { createPersonDependencies } from '../../bounded-contexts/persons/infrastructure/dependencies'
import { UnauthorizedError } from '../../bounded-contexts/shared/domain/errors/DomainError'

export default defineEventHandler(async (event) => {
  try {
    // Get dependencies
    const deps = await createPersonDependencies(event)
    
    // Get query parameters
    const query = getQuery(event)
    
    // Use the listPersons use case
    const persons = await deps.listPersons(query)
    
    // Return DTOs with visit counts in camelCase
    return persons.map(person => ({
      id: person.id,
      name: person.name,
      address: person.address,
      notes: person.notes,
      createdAt: person.createdAt,
      updatedAt: person.updatedAt,
      visitCount: person.getTotalVisitCount()
    }))
  } catch (error) {
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