import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

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

  // Then fetch visits
  const { data, error } = await client
    .from('visits')
    .select('*')
    .eq('person_id', personId)
    .eq('user_id', user.id)
    .order('visited_at', { ascending: false })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }

  return data
})