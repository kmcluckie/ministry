import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const client = await serverSupabaseClient(event)
  const query = getQuery(event)
  const search = query.search as string | undefined

  let supabaseQuery = client
    .from('persons')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  if (search) {
    supabaseQuery = supabaseQuery.ilike('name', `%${search}%`)
  }

  const { data, error } = await supabaseQuery

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }

  return data
})