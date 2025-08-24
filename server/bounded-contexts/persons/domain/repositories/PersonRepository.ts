import type { Person } from '../entities/Person'

export interface PersonRepository {
  save(person: Person): Promise<Person>
  findById(id: string, userId: string): Promise<Person | null>
  findByUserId(userId: string, options?: {
    search?: string
    limit?: number
    offset?: number
  }): Promise<Person[]>
  delete(id: string, userId: string): Promise<void>
  exists(id: string, userId: string): Promise<boolean>
}