import { ValidationError } from '../../../shared/domain/errors/DomainError'

export class Visit {
  constructor(
    public readonly id: string,
    public readonly personId: string,
    public readonly visitedAt: Date,
    public readonly notes: string | null,
    public readonly createdAt: Date = new Date()
  ) {
    this.validateVisitDate(visitedAt)
  }

  private validateVisitDate(date: Date): void {
    if (date > new Date()) {
      throw new ValidationError('Cannot record visits for future dates')
    }
    
    // Don't allow visits older than 1 year
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    
    if (date < oneYearAgo) {
      throw new ValidationError('Cannot record visits older than 1 year')
    }
  }

  static create(personId: string, visitedAt: Date, notes?: string): Visit {
    return new Visit(
      crypto.randomUUID(),
      personId,
      visitedAt,
      notes || null
    )
  }
}