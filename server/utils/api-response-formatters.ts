/**
 * Response formatters for converting domain objects to DTOs
 * Ensures consistent camelCase formatting across all API endpoints
 */

export type PersonResponse = {
  id: string
  name: string
  address: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type PersonWithVisitCountResponse = PersonResponse & {
  visitCount: number
}

export type PersonWithVisitsResponse = PersonResponse & {
  visits: VisitResponse[]
}

export type VisitResponse = {
  id: string
  personId?: string
  visitedAt: string
  notes: string | null
  createdAt: string
}

/**
 * Domain object interfaces for better type safety
 * These allow for flexible date types (Date objects or strings)
 */
export interface PersonDomain {
  id: string
  name: string
  address: string | null
  notes: string | null
  createdAt: Date | string
  updatedAt: Date | string
  visits: readonly VisitDomain[]
  getTotalVisitCount(): number
}

export interface VisitDomain {
  id: string
  visitedAt: Date | string
  notes: string | null
  createdAt: Date | string
}

/**
 * Formats a person domain object to API response DTO
 */
export function formatPersonResponse(person: PersonDomain): PersonResponse {
  return {
    id: person.id,
    name: person.name,
    address: person.address,
    notes: person.notes,
    createdAt: person.createdAt instanceof Date ? person.createdAt.toISOString() : person.createdAt,
    updatedAt: person.updatedAt instanceof Date ? person.updatedAt.toISOString() : person.updatedAt,
  }
}

/**
 * Formats a person with visit count for list endpoints
 */
export function formatPersonWithVisitCount(person: PersonDomain): PersonWithVisitCountResponse {
  return {
    ...formatPersonResponse(person),
    visitCount: person.getTotalVisitCount(),
  }
}

/**
 * Formats a person with full visits for detail endpoints
 */
export function formatPersonWithVisits(person: PersonDomain): PersonWithVisitsResponse {
  return {
    ...formatPersonResponse(person),
    visits: person.visits.map((visit: VisitDomain) => formatVisitResponse(visit)),
  }
}

/**
 * Formats a visit domain object to API response DTO
 */
export function formatVisitResponse(visit: VisitDomain, personId?: string): VisitResponse {
  const formatted: VisitResponse = {
    id: visit.id,
    visitedAt: visit.visitedAt instanceof Date ? visit.visitedAt.toISOString() : visit.visitedAt,
    notes: visit.notes,
    createdAt: visit.createdAt instanceof Date ? visit.createdAt.toISOString() : visit.createdAt,
  }
  
  if (personId) {
    formatted.personId = personId
  }
  
  return formatted
}

/**
 * Formats visits array with sorting (most recent first) and person ID
 */
export function formatVisitsResponse(visits: VisitDomain[], personId: string): VisitResponse[] {
  return [...visits]
    .sort((a, b) => new Date(b.visitedAt).getTime() - new Date(a.visitedAt).getTime())
    .map(visit => formatVisitResponse(visit, personId))
}

/**
 * Generic formatter for arrays of domain objects
 */
export function formatArrayResponse<T, R>(
  items: T[],
  formatter: (item: T) => R
): R[] {
  return items.map(formatter)
}

/**
 * Type guards for better type safety
 */
export const typeGuards = {
  hasVisits: (person: unknown): person is PersonDomain => 
    person !== null && typeof person === 'object' && 'visits' in person && Array.isArray((person as PersonDomain).visits),
    
  hasGetTotalVisitCount: (person: unknown): person is PersonDomain =>
    person !== null && typeof person === 'object' && 'getTotalVisitCount' in person && 
    typeof (person as PersonDomain).getTotalVisitCount === 'function',
}