import { z } from 'zod'
import type { H3Event } from 'h3'
import { PersonNotFoundError, VisitNotFoundError } from '../bounded-contexts/persons/domain/errors/PersonErrors'
import { 
  ValidationError, 
  UnauthorizedError, 
  BusinessRuleViolationError,
  NotFoundError,
  DomainError 
} from '../bounded-contexts/shared/domain/errors/DomainError'

/**
 * Error to HTTP status code mapping
 */
const ERROR_STATUS_MAP = {
  [ValidationError.name]: 400,
  [PersonNotFoundError.name]: 404,
  [VisitNotFoundError.name]: 404,
  [NotFoundError.name]: 404,
  [UnauthorizedError.name]: 401,
  [BusinessRuleViolationError.name]: 409,
} as const

/**
 * Maps domain errors to appropriate HTTP status codes
 */
function getErrorStatusCode(error: Error): number {
  const errorName = error.constructor.name
  return ERROR_STATUS_MAP[errorName as keyof typeof ERROR_STATUS_MAP] || 500
}

/**
 * Extracts user-friendly error message from different error types
 */
function getErrorMessage(error: Error): string {
  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    return error.errors[0]?.message || 'Validation error'
  }
  
  // Handle domain errors
  if (error instanceof DomainError) {
    return error.message
  }
  
  // For other errors, return a generic message (don't leak internal details)
  return 'Internal server error'
}

/**
 * Determines if an error should be handled by our error mapper
 */
function isDomainError(error: Error): boolean {
  return error instanceof DomainError || error instanceof z.ZodError
}

/**
 * Generic error handler that maps domain errors to HTTP responses
 */
export function handleApiError(error: unknown): never {
  // Ensure we have an Error object
  const err = error instanceof Error ? error : new Error('Unknown error')
  
  // Handle Zod validation errors specially
  if (err instanceof z.ZodError) {
    throw createError({
      statusCode: 400,
      statusMessage: getErrorMessage(err)
    })
  }
  
  // Handle domain errors
  if (isDomainError(err)) {
    throw createError({
      statusCode: getErrorStatusCode(err),
      statusMessage: getErrorMessage(err)
    })
  }
  
  // Re-throw unknown errors (let Nuxt handle them)
  throw err
}

/**
 * Higher-order function that wraps an async handler with error handling
 */
export function withErrorHandling<T extends readonly unknown[], R>(
  handler: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args)
    } catch (error) {
      handleApiError(error)
    }
  }
}

/**
 * Validates required route parameters and throws appropriate errors
 */
export function validateRouteParam(
  event: H3Event, 
  paramName: string, 
  displayName?: string
): string {
  const value = getRouterParam(event, paramName)
  
  if (!value) {
    throw createError({
      statusCode: 400,
      statusMessage: `${displayName || paramName} is required`
    })
  }
  
  return value
}

/**
 * Type-safe wrapper for API endpoints that automatically handles errors
 */
export function defineApiHandler<T>(
  handler: (event: H3Event) => Promise<T>
) {
  return defineEventHandler(
    withErrorHandling(handler)
  )
}

/**
 * Utility for creating standardized success responses
 */
export function createSuccessResponse<T>(data: T): { success: true; data: T }
export function createSuccessResponse(): { success: true }
export function createSuccessResponse<T>(data?: T) {
  if (data !== undefined) {
    return { success: true, data }
  }
  return { success: true }
}

/**
 * Type definitions for better IDE support
 */
export type ApiHandler<T = unknown> = (event: H3Event) => Promise<T>
export type ApiResponse<T = unknown> = T | { success: true; data: T }

/**
 * Specialized validation for common patterns
 */
export const validators = {
  /**
   * Validates and returns a person ID from route parameters
   */
  personId: (event: H3Event): string => 
    validateRouteParam(event, 'id', 'Person ID'),
    
  /**
   * Validates and returns a visit ID from route parameters
   */
  visitId: (event: H3Event): string => 
    validateRouteParam(event, 'id', 'Visit ID'),
}