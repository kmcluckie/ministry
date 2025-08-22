import { DomainError } from '../../../shared/domain/errors/DomainError'

export class ReportNotFoundError extends DomainError {
  constructor(reportId: string) {
    super(`Report with ID ${reportId} not found`)
  }
}

export class UnauthorizedReportAccessError extends DomainError {
  constructor() {
    super('You are not authorized to access this report')
  }
}

export class DuplicateReportError extends DomainError {
  constructor(month: number, year: number) {
    super(`A report already exists for ${month}/${year}`)
  }
}

export class InvalidReportPeriodError extends DomainError {
  constructor(month: number, year: number) {
    super(`Invalid report period: ${month}/${year}`)
  }
}