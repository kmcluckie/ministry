import type { SupabaseClient } from '@supabase/supabase-js'
import type { PersonRepository } from '../../domain/repositories/PersonRepository'
import { Person } from '../../domain/entities/Person'
import { Visit } from '../../domain/entities/Visit'
import type { Tables, TablesInsert } from '../../../../../types/database.types'

// Type aliases for better readability
type PersonRow = Tables<'persons'>
type VisitRow = Tables<'visits'>
type PersonInsert = TablesInsert<'persons'>
type VisitInsert = TablesInsert<'visits'>

export class SupabasePersonRepository implements PersonRepository {
  constructor(private readonly client: SupabaseClient) {}

  async save(person: Person): Promise<Person> {
    // Save person record
    const personData: PersonInsert = {
      id: person.id,
      user_id: person.userId,
      name: person.name,
      address: person.address,
      notes: person.notes,
      updated_at: person.updatedAt.toISOString()
    }

    const { error: personError } = await this.client
      .from('persons')
      .upsert(personData)

    if (personError) {
      throw new Error(`Failed to save person: ${personError.message}`)
    }

    // Save visits
    if (person.visits.length > 0) {
      const visitsData: VisitInsert[] = person.visits.map(visit => ({
        id: visit.id,
        person_id: person.id,
        user_id: person.userId,
        visited_at: visit.visitedAt.toISOString(),
        notes: visit.notes,
        created_at: visit.createdAt.toISOString()
      }))

      const { error: visitsError } = await this.client
        .from('visits')
        .upsert(visitsData)

      if (visitsError) {
        throw new Error(`Failed to save visits: ${visitsError.message}`)
      }
    }

    return person
  }

  async findById(id: string, userId: string): Promise<Person | null> {
    // Get person with visits
    const { data: personData, error: personError } = await this.client
      .from('persons')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (personError || !personData) {
      return null
    }

    // Get visits for this person
    const { data: visitsData, error: visitsError } = await this.client
      .from('visits')
      .select('*')
      .eq('person_id', id)
      .eq('user_id', userId)
      .order('visited_at', { ascending: false })

    if (visitsError) {
      throw new Error(`Failed to fetch visits: ${visitsError.message}`)
    }

    return this.toDomain(personData, visitsData || [])
  }

  async findByUserId(
    userId: string, 
    options: { search?: string; limit?: number; offset?: number } = {}
  ): Promise<Person[]> {
    let query = this.client
      .from('persons')
      .select('*')
      .eq('user_id', userId)
      .order('name')

    if (options.search) {
      query = query.or(`name.ilike.%${options.search}%,address.ilike.%${options.search}%,notes.ilike.%${options.search}%`)
    }

    if (options.limit) {
      query = query.limit(options.limit)
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1)
    }

    const { data: personsData, error: personsError } = await query

    if (personsError) {
      throw new Error(`Failed to fetch persons: ${personsError.message}`)
    }

    if (!personsData || personsData.length === 0) {
      return []
    }

    // Get all visits for these persons in one query
    const personIds = personsData.map(p => p.id)
    const { data: allVisitsData, error: visitsError } = await this.client
      .from('visits')
      .select('*')
      .in('person_id', personIds)
      .eq('user_id', userId)
      .order('visited_at', { ascending: false })

    if (visitsError) {
      throw new Error(`Failed to fetch visits: ${visitsError.message}`)
    }

    // Group visits by person_id
    const visitsByPersonId = (allVisitsData || []).reduce((acc, visit) => {
      if (!acc[visit.person_id]) {
        acc[visit.person_id] = []
      }
      acc[visit.person_id].push(visit)
      return acc
    }, {} as Record<string, VisitRow[]>)

    // Convert to domain objects
    return personsData.map(personData => 
      this.toDomain(personData, visitsByPersonId[personData.id] || [])
    )
  }

  async delete(id: string, userId: string): Promise<void> {
    // Delete visits first (due to foreign key constraint)
    const { error: visitsError } = await this.client
      .from('visits')
      .delete()
      .eq('person_id', id)
      .eq('user_id', userId)

    if (visitsError) {
      throw new Error(`Failed to delete visits: ${visitsError.message}`)
    }

    // Delete person
    const { error: personError } = await this.client
      .from('persons')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (personError) {
      throw new Error(`Failed to delete person: ${personError.message}`)
    }
  }

  async exists(id: string, userId: string): Promise<boolean> {
    const { data, error } = await this.client
      .from('persons')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    return !error && !!data
  }

  private toDomain(personData: PersonRow, visitsData: VisitRow[]): Person {
    const visits = visitsData.map(visitData => new Visit(
      visitData.id,
      visitData.person_id,
      new Date(visitData.visited_at),
      visitData.notes,
      new Date(visitData.created_at)
    ))

    return new Person(
      personData.id,
      personData.name,
      personData.address,
      personData.notes,
      personData.user_id,
      new Date(personData.created_at),
      new Date(personData.updated_at),
      visits
    )
  }
}