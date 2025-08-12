<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="max-w-sm w-full space-y-8 p-8">
      <div>
        <h2 class="mt-6 text-center text-2xl font-extrabold">
          Create your account
        </h2>
        <p class="mt-2 text-center text-sm text-[var(--ui-text-muted)]">
          Or
          <NuxtLink to="/login" class="text-[var(--ui-primary)]">
            sign in to your account
          </NuxtLink>
        </p>
      </div>
      
      <UForm :schema="schema" :state="state" @submit="onSubmit" class="mt-8 space-y-4 flex flex-col">
        <UFormGroup label="Email" name="email">
          <UInput v-model="state.email" type="email" placeholder="Enter your email" class="w-full" />
        </UFormGroup>

        <UFormGroup label="Password" name="password">
          <UInput v-model="state.password" type="password" placeholder="Enter your password" class="w-full" />
        </UFormGroup>

        <UFormGroup label="Confirm Password" name="confirmPassword">
          <UInput v-model="state.confirmPassword" type="password" placeholder="Confirm your password" class="w-full" />
        </UFormGroup>

        <UButton type="submit" block size="lg" :loading="loading">
          Create account
        </UButton>
      </UForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

definePageMeta({
  layout: false
})

const { client } = useSupabase()
const router = useRouter()

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

type Schema = z.output<typeof schema>

const state = reactive({
  email: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  
  try {
    const { error } = await client.auth.signUp({
      email: event.data.email,
      password: event.data.password
    })
    
    if (error) throw error
    
    const toast = useToast()
    toast.add({
      title: 'Success',
      description: 'Account created successfully! Please check your email for verification.',
      color: 'success'
    })
    
    await router.push('/login')
  } catch (error: any) {
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to create account',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>