import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { z } from 'zod'

const createPersonSchema = z.object({
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

  const body = await readBody(event)
  
  // Validate input
  const result = createPersonSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.errors[0]?.message || 'Validation error'
    })
  }

  const client = await serverSupabaseClient(event)
  
  const { data, error } = await (client as any)
    .from('persons')
    .insert({
      ...result.data,
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