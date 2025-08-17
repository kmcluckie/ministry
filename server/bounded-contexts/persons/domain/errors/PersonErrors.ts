import { DomainError } from '../../../shared/domain/errors/DomainError'

export class PersonNotFoundError extends DomainError {
  constructor(personId: string) {
    super(`Person with ID ${personId} not found`)
  }
}

export class PersonAccessDeniedError extends DomainError {
  constructor() {
    super('You do not have permission to access this person')
  }
}

export class VisitNotFoundError extends DomainError {
  constructor(visitId: string) {
    super(`Visit with ID ${visitId} not found`)
  }
}