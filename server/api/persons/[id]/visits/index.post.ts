import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { z } from 'zod'

const createVisitSchema = z.object({
  visited_at: z.string().datetime(),
  notes: z.string().max(2000, 'Notes must be less than 2000 characters').nullable().optional()
})

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const personId = getRouterParam(event, 'id')
  
  if (!personId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Person ID is required'
    })
  }

  const body = await readBody(event)
  
  // Validate input
  const result = createVisitSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.errors[0].message
    })
  }

  const client = await serverSupabaseClient(event)
  
  // First verify the person exists and belongs to the user
  const { data: person, error: personError } = await client
    .from('persons')
    .select('id')
    .eq('id', personId)
    .eq('user_id', user.id)
    .single()

  if (personError || !person) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Person not found'
    })
  }

  // Create the visit
  const { data, error } = await client
    .from('visits')
    .insert({
      ...result.data,
      person_id: personId,
      user_id: user.id
    })
    .select()
    .single()

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }

  return data
})