import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { z } from 'zod'

const updatePersonSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  address: z.string().nullable().optional(),
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

  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Person ID is required'
    })
  }

  const body = await readBody(event)
  
  // Validate input
  const result = updatePersonSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.errors[0].message
    })
  }

  const client = await serverSupabaseClient(event)
  
  const { data, error } = await client
    .from('persons')
    .update({
      ...result.data,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Person not found'
      })
    }
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }

  return data
})