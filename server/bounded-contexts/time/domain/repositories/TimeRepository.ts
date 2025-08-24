import type { Time } from '../entities/Time'

export interface TimeRepository {
  save(time: Time): Promise<Time>
  findById(id: string, userId: string): Promise<Time | null>
  findByUserId(userId: string, options?: {
    limit?: number
    offset?: number
    type?: string[]
    month?: { year: number, month: number }
    serviceYear?: number
  }): Promise<Time[]>
  update(time: Time): Promise<Time>
  delete(id: string, userId: string): Promise<void>
  findDistinctTypes(userId: string): Promise<string[]>
}