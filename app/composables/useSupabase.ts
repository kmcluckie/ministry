import type { Database } from '../../types/database.types'

export const useSupabase = () => {
  const client = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  
  return {
    client,
    user
  }
}