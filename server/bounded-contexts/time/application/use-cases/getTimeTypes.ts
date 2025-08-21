import type { TimeRepository } from '../../domain/repositories/TimeRepository'

export async function getTimeTypes(
  repository: TimeRepository,
  userId: string
): Promise<string[]> {
  // Get all distinct types for this user
  const userTypes = await repository.findDistinctTypes(userId)
  
  // Ensure "Ministry" is always included as the default option
  const allTypes = new Set(['Ministry', ...userTypes])
  
  return Array.from(allTypes).sort()
}