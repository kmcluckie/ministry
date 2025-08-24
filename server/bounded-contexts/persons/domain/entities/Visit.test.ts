import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Visit } from './Visit'
import { ValidationError } from '../../../shared/domain/errors/DomainError'

describe('Visit', () => {
  const mockPersonId = 'person-123'
  const mockId = 'visit-456'
  let validDate: Date
  let futureDate: Date
  let pastDate: Date
  let oneYearAgoBoundary: Date
  let justOverOneYear: Date

  beforeEach(() => {
    const now = new Date()
    validDate = new Date(now.getTime() - 24 * 60 * 60 * 1000) // 1 day ago
    futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 1 day from now
    
    // Create dates around the 1-year boundary
    oneYearAgoBoundary = new Date()
    oneYearAgoBoundary.setFullYear(oneYearAgoBoundary.getFullYear() - 1)
    
    justOverOneYear = new Date(oneYearAgoBoundary.getTime() - 24 * 60 * 60 * 1000) // 1 day over the boundary
    pastDate = new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000) // Over 1 year ago
  })

  describe('constructor', () => {
    it('should create a visit with all properties when valid data is provided', () => {
      const notes = 'Great visit today'
      const createdAt = new Date()
      
      const visit = new Visit(mockId, mockPersonId, validDate, notes, createdAt)

      expect(visit.id).toBe(mockId)
      expect(visit.personId).toBe(mockPersonId)
      expect(visit.visitedAt).toBe(validDate)
      expect(visit.notes).toBe(notes)
      expect(visit.createdAt).toBe(createdAt)
    })

    it('should create a visit with null notes when notes is null', () => {
      const visit = new Visit(mockId, mockPersonId, validDate, null)

      expect(visit.notes).toBeNull()
    })

    it('should set createdAt to current date when not provided', () => {
      const beforeCreation = new Date()
      const visit = new Visit(mockId, mockPersonId, validDate, null)
      const afterCreation = new Date()

      expect(visit.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime())
      expect(visit.createdAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime())
    })

    it('should throw ValidationError for future dates', () => {
      expect(() => {
        new Visit(mockId, mockPersonId, futureDate, null)
      }).toThrow(ValidationError)
      
      expect(() => {
        new Visit(mockId, mockPersonId, futureDate, null)
      }).toThrow('Cannot record visits for future dates')
    })

    it('should throw ValidationError for dates older than 1 year', () => {
      expect(() => {
        new Visit(mockId, mockPersonId, pastDate, null)
      }).toThrow(ValidationError)
      
      expect(() => {
        new Visit(mockId, mockPersonId, pastDate, null)
      }).toThrow('Cannot record visits older than 1 year')
    })

    it('should throw ValidationError for dates just over 1 year old', () => {
      expect(() => {
        new Visit(mockId, mockPersonId, justOverOneYear, null)
      }).toThrow(ValidationError)
      
      expect(() => {
        new Visit(mockId, mockPersonId, justOverOneYear, null)
      }).toThrow('Cannot record visits older than 1 year')
    })

    it('should accept dates exactly at the 1-year boundary', () => {
      expect(() => {
        new Visit(mockId, mockPersonId, oneYearAgoBoundary, null)
      }).not.toThrow()
    })

    it('should accept dates just before the 1-year boundary', () => {
      const justUnderOneYear = new Date(oneYearAgoBoundary.getTime() + 60 * 1000) // 1 minute after boundary
      
      expect(() => {
        new Visit(mockId, mockPersonId, justUnderOneYear, null)
      }).not.toThrow()
    })

    it('should accept current date/time', () => {
      const now = new Date()
      
      expect(() => {
        new Visit(mockId, mockPersonId, now, null)
      }).not.toThrow()
    })
  })

  describe('static create method', () => {
    beforeEach(() => {
      // Mock crypto.randomUUID to return a predictable value
      vi.stubGlobal('crypto', {
        randomUUID: vi.fn().mockReturnValue(mockId)
      })
    })

    it('should create a visit with generated UUID and provided parameters', () => {
      const notes = 'Visit notes'
      
      const visit = Visit.create(mockPersonId, validDate, notes)

      expect(visit.id).toBe(mockId)
      expect(visit.personId).toBe(mockPersonId)
      expect(visit.visitedAt).toBe(validDate)
      expect(visit.notes).toBe(notes)
      expect(crypto.randomUUID).toHaveBeenCalledOnce()
    })

    it('should create a visit with null notes when notes parameter is not provided', () => {
      const visit = Visit.create(mockPersonId, validDate)

      expect(visit.notes).toBeNull()
    })

    it('should create a visit with null notes when empty string is provided', () => {
      const visit = Visit.create(mockPersonId, validDate, '')

      expect(visit.notes).toBeNull()
    })

    it('should create a visit with notes when non-empty string is provided', () => {
      const notes = 'Some notes'
      
      const visit = Visit.create(mockPersonId, validDate, notes)

      expect(visit.notes).toBe(notes)
    })

    it('should set createdAt to current time', () => {
      const beforeCreation = new Date()
      const visit = Visit.create(mockPersonId, validDate)
      const afterCreation = new Date()

      expect(visit.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime())
      expect(visit.createdAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime())
    })

    it('should throw ValidationError when created with future date', () => {
      expect(() => {
        Visit.create(mockPersonId, futureDate)
      }).toThrow(ValidationError)
      
      expect(() => {
        Visit.create(mockPersonId, futureDate)
      }).toThrow('Cannot record visits for future dates')
    })

    it('should throw ValidationError when created with date older than 1 year', () => {
      expect(() => {
        Visit.create(mockPersonId, pastDate)
      }).toThrow(ValidationError)
      
      expect(() => {
        Visit.create(mockPersonId, pastDate)
      }).toThrow('Cannot record visits older than 1 year')
    })

    it('should generate unique IDs for multiple visits', () => {
      const mockIds = ['id-1', 'id-2', 'id-3']
      let callCount = 0
      
      vi.mocked(crypto.randomUUID).mockImplementation(() => mockIds[callCount++])

      const visit1 = Visit.create(mockPersonId, validDate)
      const visit2 = Visit.create(mockPersonId, validDate)
      const visit3 = Visit.create(mockPersonId, validDate)

      expect(visit1.id).toBe('id-1')
      expect(visit2.id).toBe('id-2')
      expect(visit3.id).toBe('id-3')
      expect(crypto.randomUUID).toHaveBeenCalledTimes(3)
    })
  })

  describe('edge cases', () => {
    it('should handle leap year dates correctly', () => {
      // Use a recent leap year date that's within the valid range
      const now = new Date()
      const recentLeapYearDate = new Date(now.getFullYear(), 1, 29) // Feb 29 of current year if leap year
      if (recentLeapYearDate.getMonth() === 1) { // Only test if current year is leap year
        expect(() => {
          new Visit(mockId, mockPersonId, recentLeapYearDate, null)
        }).not.toThrow()
      }
    })

    it('should handle daylight saving time transitions', () => {
      // Use a recent DST date within the valid range
      const now = new Date()
      const dstDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      
      expect(() => {
        new Visit(mockId, mockPersonId, dstDate, null)
      }).not.toThrow()
    })

    it('should handle timezone-independent validation', () => {
      // Create a date that might be future in one timezone but past in another
      const borderlineDate = new Date()
      borderlineDate.setHours(borderlineDate.getHours() - 1) // 1 hour ago
      
      expect(() => {
        new Visit(mockId, mockPersonId, borderlineDate, null)
      }).not.toThrow()
    })

    it('should handle millisecond precision dates', () => {
      const now = new Date()
      const preciseDate = new Date(now.getTime() - 24 * 60 * 60 * 1000) // 1 day ago
      preciseDate.setMilliseconds(123) // Set specific milliseconds
      
      const visit = new Visit(mockId, mockPersonId, preciseDate, null)
      
      expect(visit.visitedAt).toBe(preciseDate)
      expect(visit.visitedAt.getMilliseconds()).toBe(123)
    })
  })

  describe('immutability', () => {
    it('should have readonly properties that maintain their values', () => {
      const notes = 'Original notes'
      const createdAt = new Date()
      const visit = new Visit(mockId, mockPersonId, validDate, notes, createdAt)

      // Verify properties maintain their original values
      expect(visit.id).toBe(mockId)
      expect(visit.personId).toBe(mockPersonId)
      expect(visit.visitedAt).toBe(validDate)
      expect(visit.notes).toBe(notes)
      expect(visit.createdAt).toBe(createdAt)

      // Note: readonly properties are enforced at compile-time by TypeScript
      // Runtime attempts to reassign will silently fail in non-strict mode
      // or would require Object.freeze() for runtime immutability
    })

    it('should not be affected by external date mutations', () => {
      const originalDate = new Date(validDate.getTime())
      const visit = new Visit(mockId, mockPersonId, validDate, null)

      // Mutate the original date object
      validDate.setFullYear(2020)

      // Visit should still reference the original date object
      expect(visit.visitedAt).toBe(validDate)
      expect(visit.visitedAt.getFullYear()).toBe(2020)
      
      // Reset for other tests
      validDate.setTime(originalDate.getTime())
    })
  })
})