import { ValidationError, BusinessRuleViolationError } from '../../../shared/domain/errors/DomainError'

export class Report {
  constructor(
    public readonly id: string,
    private _month: number,
    private _year: number,
    private _studies: number,
    private _ministryHours: number,
    private _creditHours: number,
    public readonly userId: string,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {
    this.validateMonth(_month)
    this.validateYear(_year)
    this.validateStudies(_studies)
    this.validateMinistryHours(_ministryHours)
    this.validateCreditHours(_creditHours)
    this.validateReportPeriod(_month, _year)
  }

  private validateMonth(month: number): void {
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      throw new ValidationError('Month must be an integer between 1 and 12')
    }
  }

  private validateYear(year: number): void {
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      throw new ValidationError('Year must be an integer between 2000 and 2100')
    }
  }

  private validateStudies(studies: number): void {
    if (!Number.isInteger(studies) || studies < 0) {
      throw new ValidationError('Studies must be a non-negative integer')
    }
  }

  private validateMinistryHours(hours: number): void {
    if (!Number.isInteger(hours) || hours < 0 || hours > 744) {
      throw new ValidationError('Ministry hours must be an integer between 0 and 744')
    }
  }

  private validateCreditHours(hours: number): void {
    if (!Number.isInteger(hours) || hours < 0 || hours > 744) {
      throw new ValidationError('Credit hours must be an integer between 0 and 744')
    }
  }

  private validateReportPeriod(month: number, year: number): void {
    // Business rule: Cannot report for future months
    const reportDate = new Date(year, month - 1, 1) // First day of report month
    const currentDate = new Date()
    const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    
    if (reportDate > currentMonth) {
      throw new BusinessRuleViolationError('Cannot create reports for future months')
    }
  }

  // Getters
  get month(): number {
    return this._month
  }

  get year(): number {
    return this._year
  }

  get studies(): number {
    return this._studies
  }

  get ministryHours(): number {
    return this._ministryHours
  }

  get creditHours(): number {
    return this._creditHours
  }

  // Business methods
  updateReportData(data: {
    studies?: number
    ministryHours?: number
    creditHours?: number
  }): void {
    if (data.studies !== undefined) {
      this.validateStudies(data.studies)
      this._studies = data.studies
    }
    
    if (data.ministryHours !== undefined) {
      this.validateMinistryHours(data.ministryHours)
      this._ministryHours = data.ministryHours
    }
    
    if (data.creditHours !== undefined) {
      this.validateCreditHours(data.creditHours)
      this._creditHours = data.creditHours
    }
    
    this.updatedAt = new Date()
  }

  updatePeriod(month: number, year: number): void {
    this.validateMonth(month)
    this.validateYear(year)
    this.validateReportPeriod(month, year)
    this._month = month
    this._year = year
    this.updatedAt = new Date()
  }

  canBeDeletedBy(userId: string): boolean {
    return this.userId === userId
  }

  canBeUpdatedBy(userId: string): boolean {
    return this.userId === userId
  }

  getTotalHours(): number {
    return this._ministryHours + this._creditHours
  }

  getReportPeriodKey(): string {
    return `${this._year}-${this._month.toString().padStart(2, '0')}`
  }

  // Check if this report is for the same period as another report
  isSamePeriod(month: number, year: number): boolean {
    return this._month === month && this._year === year
  }

  // Factory method
  static create(data: {
    month: number
    year: number
    studies: number
    ministryHours: number
    creditHours: number
    userId: string
  }): Report {
    return new Report(
      crypto.randomUUID(),
      data.month,
      data.year,
      data.studies,
      data.ministryHours,
      data.creditHours,
      data.userId,
      new Date(),
      new Date()
    )
  }
}