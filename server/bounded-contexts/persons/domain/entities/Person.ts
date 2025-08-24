import { ValidationError, BusinessRuleViolationError } from '../../../shared/domain/errors/DomainError'
import { Visit } from './Visit'

export class Person {
  private _visits: Visit[] = []

  constructor(
    public readonly id: string,
    private _name: string,
    private _address: string | null,
    private _notes: string | null,
    public readonly userId: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
    visits: Visit[] = []
  ) {
    this.validateName(_name)
    this.validateNotes(_notes)
    this._visits = visits
  }

  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationError('Person name cannot be empty')
    }
    
    if (name.length > 255) {
      throw new ValidationError('Person name cannot exceed 255 characters')
    }
  }

  private validateNotes(notes: string | null): void {
    if (notes && notes.length > 2000) {
      throw new ValidationError('Notes cannot exceed 2000 characters')
    }
  }

  // Getters
  get name(): string {
    return this._name
  }

  get address(): string | null {
    return this._address
  }

  get notes(): string | null {
    return this._notes
  }

  get visits(): readonly Visit[] {
    return [...this._visits]
  }

  // Business methods
  updateName(newName: string): void {
    this.validateName(newName)
    this._name = newName
    this.updatedAt = new Date()
  }

  updateAddress(newAddress: string | null): void {
    this._address = newAddress
    this.updatedAt = new Date()
  }

  updateNotes(newNotes: string | null): void {
    this.validateNotes(newNotes)
    this._notes = newNotes
    this.updatedAt = new Date()
  }

  addVisit(visitedAt: Date, notes?: string): Visit {
    // Business rule: Can't add duplicate visits on the same day
    const visitDate = visitedAt.toDateString()
    const existingVisit = this._visits.find(v => 
      v.visitedAt.toDateString() === visitDate
    )
    
    if (existingVisit) {
      throw new BusinessRuleViolationError(
        `A visit is already recorded for ${visitDate}`
      )
    }

    const visit = Visit.create(this.id, visitedAt, notes)
    this._visits.push(visit)
    this.updatedAt = new Date()
    
    return visit
  }

  removeVisit(visitId: string): void {
    const visitIndex = this._visits.findIndex(v => v.id === visitId)
    
    if (visitIndex === -1) {
      throw new ValidationError('Visit not found')
    }
    
    this._visits.splice(visitIndex, 1)
    this.updatedAt = new Date()
  }

  updateVisit(visitId: string, newVisitedAt: Date, newNotes?: string | null): Visit {
    const visitIndex = this._visits.findIndex(v => v.id === visitId)
    
    if (visitIndex === -1) {
      throw new ValidationError('Visit not found')
    }

    const existingVisit = this._visits[visitIndex]!
    
    // Business rule: Can't update visit to conflict with existing visits on the same day
    const newVisitDate = newVisitedAt.toDateString()
    const conflictingVisit = this._visits.find(v => 
      v.id !== visitId && v.visitedAt.toDateString() === newVisitDate
    )
    
    if (conflictingVisit) {
      throw new BusinessRuleViolationError(
        `A visit is already recorded for ${newVisitDate}`
      )
    }

    // Create new visit with updated data, preserving original id and createdAt
    const updatedVisit = new Visit(
      existingVisit.id,
      this.id,
      newVisitedAt,
      newNotes ?? null,
      existingVisit.createdAt
    )
    
    // Replace the visit in the array
    this._visits[visitIndex] = updatedVisit
    this.updatedAt = new Date()
    
    return updatedVisit
  }

  canBeDeletedBy(userId: string): boolean {
    return this.userId === userId
  }

  getVisitsSince(date: Date): Visit[] {
    return this._visits.filter(v => v.visitedAt >= date)
  }

  getTotalVisitCount(): number {
    return this._visits.length
  }

  // Factory method
  static create(data: {
    name: string
    address?: string | null
    notes?: string | null
    userId: string
  }): Person {
    return new Person(
      crypto.randomUUID(),
      data.name,
      data.address || null,
      data.notes || null,
      data.userId,
      new Date(),
      new Date()
    )
  }
}