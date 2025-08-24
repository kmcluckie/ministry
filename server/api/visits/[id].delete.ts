import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { defineApiHandler, validators, createSuccessResponse } from '../../utils/api-error-handler'

export default defineApiHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  // Get visit ID from route (validates automatically)
  const id = validators.visitId(event)

  const client = await serverSupabaseClient(event)
  
  const { error } = await client
    .from('visits')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }

  return createSuccessResponse()
})