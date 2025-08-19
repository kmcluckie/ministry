import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { SupabasePersonRepository } from './SupabasePersonRepository'
import { Person } from '../../domain/entities/Person'
import { 
  createTestClient, 
  generateTestUserId, 
  cleanupTestData, 
  setupTestData,
  withTestEnvironment
} from '../../../../../tests/utils/test-database'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../../../../types/database.types'

describe('SupabasePersonRepository Integration Tests', () => {
  let repository: SupabasePersonRepository
  let client: SupabaseClient<Database>
  let testUserId: string

  beforeEach(async () => {
    client = createTestClient()
    testUserId = generateTestUserId()
    repository = new SupabasePersonRepository(client)
    
    await setupTestData(client, testUserId)
  })

  afterEach(async () => {
    await cleanupTestData(client, testUserId)
  })

  describe('save()', () => {
    it('should save a person without visits to the database', async () => {
      // Arrange
      const person = Person.create({
        name: 'John Doe',
        address: '123 Main St',
        notes: 'Test person',
        userId: testUserId
      })

      // Act
      const savedPerson = await repository.save(person)

      // Assert
      expect(savedPerson.id).toBe(person.id)
      expect(savedPerson.name).toBe('John Doe')

      // Verify data was actually written to database
      const { data, error } = await client
        .from('persons')
        .select('*')
        .eq('id', person.id)
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data!.name).toBe('John Doe')
      expect(data!.address).toBe('123 Main St')
      expect(data!.user_id).toBe(testUserId)
    })

    it('should save a person with visits to the database', async () => {
      // Arrange
      const person = Person.create({
        name: 'Jane Smith',
        address: '456 Oak Ave',
        userId: testUserId
      })

      person.addVisit(new Date('2023-01-01'), 'First visit')
      person.addVisit(new Date('2023-01-02'), 'Second visit')

      // Act
      await repository.save(person)

      // Assert - Check person was saved
      const { data: personData } = await client
        .from('persons')
        .select('*')
        .eq('id', person.id)
        .single()

      expect(personData!.name).toBe('Jane Smith')

      // Assert - Check visits were saved
      const { data: visitsData } = await client
        .from('visits')
        .select('*')
        .eq('person_id', person.id)
        .order('visited_at')

      expect(visitsData).toHaveLength(2)
      expect(visitsData![0].notes).toBe('First visit')
      expect(visitsData![1].notes).toBe('Second visit')
    })

    it('should handle upsert behavior correctly', async () => {
      // Arrange - Create and save initial person
      const person = Person.create({
        name: 'Update Test',
        address: 'Original Address',
        userId: testUserId
      })
      await repository.save(person)

      // Act - Update the person
      const updatedPerson = new Person(
        person.id,
        'Updated Name',
        'Updated Address',
        'Updated notes',
        testUserId,
        person.createdAt,
        new Date(),
        []
      )
      await repository.save(updatedPerson)

      // Assert - Verify update worked
      const { data } = await client
        .from('persons')
        .select('*')
        .eq('id', person.id)
        .single()

      expect(data!.name).toBe('Updated Name')
      expect(data!.address).toBe('Updated Address')
      expect(data!.notes).toBe('Updated notes')
    })
  })

  describe('findById()', () => {
    it('should return null for non-existent person', async () => {
      // Act
      const result = await repository.findById('non-existent-id', testUserId)

      // Assert
      expect(result).toBeNull()
    })

    it('should return null for person belonging to different user', async () => {
      // Arrange - Create person for different user
      const otherUserId = generateTestUserId()
      const person = Person.create({
        name: 'Other User Person',
        userId: otherUserId
      })
      await repository.save(person)

      // Act - Try to find with wrong user ID
      const result = await repository.findById(person.id, testUserId)

      // Assert
      expect(result).toBeNull()
    })

    it('should return person with visits when found', async () => {
      // Arrange
      const person = Person.create({
        name: 'Find Test Person',
        address: '789 Pine St',
        userId: testUserId
      })

      person.addVisit(new Date('2023-01-01'), 'Test visit')
      
      await repository.save(person)

      // Act
      const foundPerson = await repository.findById(person.id, testUserId)

      // Assert
      expect(foundPerson).not.toBeNull()
      expect(foundPerson!.name).toBe('Find Test Person')
      expect(foundPerson!.address).toBe('789 Pine St')
      expect(foundPerson!.visits).toHaveLength(1)
      expect(foundPerson!.visits[0].notes).toBe('Test visit')
    })
  })

  describe('findByUserId()', () => {
    it('should return empty array when no persons exist', async () => {
      // Act
      const result = await repository.findByUserId(testUserId)

      // Assert
      expect(result).toEqual([])
    })

    it('should return all persons for user', async () => {
      // Arrange
      const person1 = Person.create({ name: 'Person 1', userId: testUserId })
      const person2 = Person.create({ name: 'Person 2', userId: testUserId })
      
      await repository.save(person1)
      await repository.save(person2)

      // Act
      const result = await repository.findByUserId(testUserId)

      // Assert
      expect(result).toHaveLength(2)
      expect(result.map(p => p.name).sort()).toEqual(['Person 1', 'Person 2'])
    })

    it('should filter by search term', async () => {
      // Arrange
      const person1 = Person.create({ 
        name: 'John Smith', 
        address: '123 Oak Street',
        userId: testUserId 
      })
      const person2 = Person.create({ 
        name: 'Jane Doe', 
        address: '456 Pine Avenue',
        userId: testUserId 
      })
      
      await repository.save(person1)
      await repository.save(person2)

      // Act
      const result = await repository.findByUserId(testUserId, { search: 'Oak' })

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('John Smith')
    })

    it('should respect pagination parameters', async () => {
      // Arrange - Create 5 test persons
      const persons = Array.from({ length: 5 }, (_, i) => 
        Person.create({ 
          name: `Person ${i + 1}`, 
          userId: testUserId 
        })
      )
      
      for (const person of persons) {
        await repository.save(person)
      }

      // Act
      const result = await repository.findByUserId(testUserId, { 
        limit: 2, 
        offset: 1 
      })

      // Assert
      expect(result).toHaveLength(2)
      // Names should be sorted alphabetically: Person 1, Person 2, Person 3, Person 4, Person 5
      // With offset 1 and limit 2, we should get Person 2 and Person 3
      expect(result[0].name).toBe('Person 2')
      expect(result[1].name).toBe('Person 3')
    })
  })

  describe('delete()', () => {
    it('should delete person and cascade to visits', async () => {
      // Arrange
      const person = Person.create({
        name: 'Delete Test',
        userId: testUserId
      })
      
      person.addVisit(new Date(), 'Visit to delete')
      
      await repository.save(person)

      // Verify data exists
      const existsBefore = await repository.exists(person.id, testUserId)
      expect(existsBefore).toBe(true)

      // Act
      await repository.delete(person.id, testUserId)

      // Assert - Person should be deleted
      const existsAfter = await repository.exists(person.id, testUserId)
      expect(existsAfter).toBe(false)

      // Assert - Visits should be cascade deleted
      const { data: visits } = await client
        .from('visits')
        .select('*')
        .eq('person_id', person.id)

      expect(visits).toHaveLength(0)
    })

    it('should not delete persons belonging to other users', async () => {
      // Arrange
      const otherUserId = generateTestUserId()
      const person = Person.create({
        name: 'Other User Person',
        userId: otherUserId
      })
      await repository.save(person)

      // Act - Try to delete with wrong user ID
      await repository.delete(person.id, testUserId)

      // Assert - Person should still exist
      const { data } = await client
        .from('persons')
        .select('*')
        .eq('id', person.id)
        .single()

      expect(data).not.toBeNull()
      expect(data!.name).toBe('Other User Person')
    })
  })

  describe('exists()', () => {
    it('should return false for non-existent person', async () => {
      // Act
      const result = await repository.exists('non-existent-id', testUserId)

      // Assert
      expect(result).toBe(false)
    })

    it('should return true for existing person', async () => {
      // Arrange
      const person = Person.create({
        name: 'Exists Test',
        userId: testUserId
      })
      await repository.save(person)

      // Act
      const result = await repository.exists(person.id, testUserId)

      // Assert
      expect(result).toBe(true)
    })

    it('should return false for person belonging to different user', async () => {
      // Arrange
      const otherUserId = generateTestUserId()
      const person = Person.create({
        name: 'Other User Person',
        userId: otherUserId
      })
      await repository.save(person)

      // Act
      const result = await repository.exists(person.id, testUserId)

      // Assert
      expect(result).toBe(false)
    })
  })

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      // This test would need a way to simulate database errors
      // For now, we'll test with invalid data that might cause constraint violations
      
      const invalidPerson = new Person(
        'invalid-id',
        '', // Empty name might violate NOT NULL constraint
        '',
        null,
        'invalid-user-id',
        new Date(),
        new Date(),
        []
      )

      // Act & Assert
      await expect(repository.save(invalidPerson)).rejects.toThrow()
    })
  })
})

// Alternative test style using the helper function
describe('SupabasePersonRepository with Test Environment Helper', () => {
  it('should handle complete workflow', async () => {
    await withTestEnvironment(async (client, userId) => {
      const repository = new SupabasePersonRepository(client)
      
      // Create person
      const person = Person.create({
        name: 'Workflow Test',
        userId
      })
      
      await repository.save(person)
      
      // Verify it exists
      const exists = await repository.exists(person.id, userId)
      expect(exists).toBe(true)
      
      // Find it
      const found = await repository.findById(person.id, userId)
      expect(found!.name).toBe('Workflow Test')
      
      // Delete it
      await repository.delete(person.id, userId)
      
      // Verify it's gone
      const existsAfter = await repository.exists(person.id, userId)
      expect(existsAfter).toBe(false)
    })
  })
})