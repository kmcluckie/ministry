import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

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

  const client = await serverSupabaseClient(event)
  
  // First delete all visits associated with this person
  const { error: visitsError } = await client
    .from('visits')
    .delete()
    .eq('person_id', id)
    .eq('user_id', user.id)

  if (visitsError) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete associated visits'
    })
  }

  // Then delete the person
  const { error } = await client
    .from('persons')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }

  return { success: true }
})