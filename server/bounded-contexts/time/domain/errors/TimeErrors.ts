import { DomainError } from '../../../shared/domain/errors/DomainError'

export class TimeNotFoundError extends DomainError {
  constructor(timeId: string) {
    super(`Time record with ID ${timeId} not found`)
  }
}

export class UnauthorizedTimeAccessError extends DomainError {
  constructor() {
    super('You are not authorized to access this time record')
  }
}

export class DuplicateTimeError extends DomainError {
  constructor(recordedOn: Date, type: string) {
    const dateStr = recordedOn.toLocaleDateString()
    super(`A time record of type "${type}" is already recorded for ${dateStr}`)
  }
}