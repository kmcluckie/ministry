export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

export class ValidationError extends DomainError {}

export class NotFoundError extends DomainError {}

export class UnauthorizedError extends DomainError {}

export class BusinessRuleViolationError extends DomainError {}