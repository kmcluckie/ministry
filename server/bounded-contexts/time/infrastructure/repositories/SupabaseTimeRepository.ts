import type { SupabaseClient } from '@supabase/supabase-js'
import { Time } from '../../domain/entities/Time'
import type { TimeRepository } from '../../domain/repositories/TimeRepository'
import { TimeNotFoundError } from '../../domain/errors/TimeErrors'

type DatabaseTimeRecord = {
  id: string
  user_id: string
  type: string
  recorded_on: string
  hours: number
  minutes: number
  created_at: string
  updated_at: string
}

export class SupabaseTimeRepository implements TimeRepository {
  constructor(private supabase: SupabaseClient) {}

  async save(time: Time): Promise<Time> {
    const { data, error } = await this.supabase
      .from('time_records')
      .insert({
        id: time.id,
        user_id: time.userId,
        type: time.type,
        recorded_on: time.recordedOn.toISOString().split('T')[0], // Convert to date string
        hours: time.hours,
        minutes: time.minutes,
        created_at: time.createdAt.toISOString(),
        updated_at: time.updatedAt.toISOString()
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to save time record: ${error.message}`)
    }

    return this.mapToEntity(data)
  }

  async findById(id: string, userId: string): Promise<Time | null> {
    const { data, error } = await this.supabase
      .from('time_records')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null
      }
      throw new Error(`Failed to find time record: ${error.message}`)
    }

    return this.mapToEntity(data)
  }

  async findByUserId(userId: string, options?: {
    limit?: number
    offset?: number
    type?: string[]
    month?: { year: number, month: number }
    serviceYear?: number
  }): Promise<Time[]> {
    let query = this.supabase
      .from('time_records')
      .select('*')
      .eq('user_id', userId)

    // Apply type filter
    if (options?.type && options.type.length > 0) {
      query = query.in('type', options.type)
    }

    // Apply month filter
    if (options?.month) {
      const startDate = new Date(options.month.year, options.month.month - 1, 1)
      const endDate = new Date(options.month.year, options.month.month, 0)
      query = query
        .gte('recorded_on', startDate.toISOString().split('T')[0])
        .lte('recorded_on', endDate.toISOString().split('T')[0])
    }

    // Apply service year filter (September 1 to August 31)
    if (options?.serviceYear) {
      const startDate = new Date(options.serviceYear - 1, 8, 1) // September 1
      const endDate = new Date(options.serviceYear, 7, 31) // August 31
      query = query
        .gte('recorded_on', startDate.toISOString().split('T')[0])
        .lte('recorded_on', endDate.toISOString().split('T')[0])
    }

    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    if (options?.offset) {
      query = query.range(options.offset, (options.offset + (options?.limit || 50)) - 1)
    }

    // Order by recorded_on descending (most recent first)
    query = query.order('recorded_on', { ascending: false })

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to find time records: ${error.message}`)
    }

    return data.map(record => this.mapToEntity(record))
  }

  async update(time: Time): Promise<Time> {
    const { data, error } = await this.supabase
      .from('time_records')
      .update({
        type: time.type,
        recorded_on: time.recordedOn.toISOString().split('T')[0],
        hours: time.hours,
        minutes: time.minutes,
        updated_at: time.updatedAt.toISOString()
      })
      .eq('id', time.id)
      .eq('user_id', time.userId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new TimeNotFoundError(time.id)
      }
      throw new Error(`Failed to update time record: ${error.message}`)
    }

    return this.mapToEntity(data)
  }

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('time_records')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to delete time record: ${error.message}`)
    }
  }

  async findDistinctTypes(userId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('time_records')
      .select('type')
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to find time types: ${error.message}`)
    }

    // Extract unique types and sort them
    const uniqueTypes = [...new Set(data.map(record => record.type))]
    return uniqueTypes.sort()
  }

  private mapToEntity(data: DatabaseTimeRecord): Time {
    return new Time(
      data.id,
      data.type,
      new Date(data.recorded_on + 'T00:00:00.000Z'), // Convert date string to Date
      data.hours,
      data.minutes,
      data.user_id,
      new Date(data.created_at),
      new Date(data.updated_at)
    )
  }
}