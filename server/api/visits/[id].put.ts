import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { z } from 'zod'

const updateVisitSchema = z.object({
  visited_at: z.string().transform((val) => {
    // Handle datetime-local format (YYYY-MM-DDTHH:mm) by adding seconds and timezone
    if (val.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
      return val + ':00.000Z'
    }
    return val
  }).pipe(z.string().datetime()),
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
      statusMessage: 'Visit ID is required'
    })
  }

  const body = await readBody(event)
  
  // Validate input
  const result = updateVisitSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.errors[0].message
    })
  }

  const client = await serverSupabaseClient(event)
  
  const { data, error } = await client
    .from('visits')
    .update(result.data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Visit not found'
      })
    }
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }

  return data
})