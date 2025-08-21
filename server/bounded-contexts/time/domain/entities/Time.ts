import { ValidationError, BusinessRuleViolationError } from '../../../shared/domain/errors/DomainError'

export class Time {
  constructor(
    public readonly id: string,
    private _type: string,
    private _recordedOn: Date,
    private _hours: number,
    private _minutes: number,
    public readonly userId: string,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {
    this.validateType(_type)
    this.validateHours(_hours)
    this.validateMinutes(_minutes)
    this.validateRecordedOn(_recordedOn)
  }

  private validateType(type: string): void {
    if (!type || type.trim().length === 0) {
      throw new ValidationError('Time type cannot be empty')
    }
    
    if (type.length > 100) {
      throw new ValidationError('Time type cannot exceed 100 characters')
    }
  }

  private validateHours(hours: number): void {
    if (!Number.isInteger(hours) || hours < 0 || hours > 24) {
      throw new ValidationError('Hours must be an integer between 0 and 24')
    }
  }

  private validateMinutes(minutes: number): void {
    if (!Number.isInteger(minutes) || minutes < 0 || minutes >= 60) {
      throw new ValidationError('Minutes must be an integer between 0 and 59')
    }
  }

  private validateRecordedOn(recordedOn: Date): void {
    if (!(recordedOn instanceof Date) || isNaN(recordedOn.getTime())) {
      throw new ValidationError('RecordedOn must be a valid date')
    }
    
    // Business rule: Cannot record time for future dates
    const today = new Date()
    today.setHours(23, 59, 59, 999) // End of today
    
    if (recordedOn > today) {
      throw new BusinessRuleViolationError('Cannot record time for future dates')
    }
  }

  // Getters
  get type(): string {
    return this._type
  }

  get recordedOn(): Date {
    return this._recordedOn
  }

  get hours(): number {
    return this._hours
  }

  get minutes(): number {
    return this._minutes
  }

  // Business methods
  updateType(newType: string): void {
    this.validateType(newType)
    this._type = newType
    this.updatedAt = new Date()
  }

  updateRecordedOn(newRecordedOn: Date): void {
    this.validateRecordedOn(newRecordedOn)
    this._recordedOn = newRecordedOn
    this.updatedAt = new Date()
  }

  updateTime(newHours: number, newMinutes: number): void {
    this.validateHours(newHours)
    this.validateMinutes(newMinutes)
    this._hours = newHours
    this._minutes = newMinutes
    this.updatedAt = new Date()
  }

  canBeDeletedBy(userId: string): boolean {
    return this.userId === userId
  }

  canBeUpdatedBy(userId: string): boolean {
    return this.userId === userId
  }

  getTotalMinutes(): number {
    return this._hours * 60 + this._minutes
  }

  getTotalHours(): number {
    return this._hours + (this._minutes / 60)
  }

  // Factory method
  static create(data: {
    type: string
    recordedOn: Date
    hours: number
    minutes: number
    userId: string
  }): Time {
    return new Time(
      crypto.randomUUID(),
      data.type,
      data.recordedOn,
      data.hours,
      data.minutes,
      data.userId,
      new Date(),
      new Date()
    )
  }
}