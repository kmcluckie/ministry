import { registerSchema } from '../../../shared/validation/authSchemas'
import { defineApiHandler } from '../../utils/api-error-handler'
import { serverSupabaseClient } from '#supabase/server'

export default defineApiHandler(async (event) => {
  const body = await readBody(event)
  
  // Validate input
  const validationResult = registerSchema.safeParse(body)
  if (!validationResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation Error',
      data: validationResult.error.errors
    })
  }

  const { name, email, password } = validationResult.data

  // Check if name is "JW" (case-insensitive)
  if (name.toLowerCase() !== 'jw') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Registration failed'
    })
  }

  // Get Supabase client
  const supabase = await serverSupabaseClient(event)

  // Create the account in Supabase
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    })
  }

  return {
    user: data.user
  }
})