<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="max-w-sm w-full space-y-8 p-8">
      <div>
        <h2 class="mt-6 text-center text-2xl font-extrabold">
          Sign in to your account
        </h2>
        <p class="mt-2 text-center text-sm text-[var(--ui-text-muted)]">
          Or
          <NuxtLink to="/register" class="text-[var(--ui-primary)]">
            create a new account
          </NuxtLink>
        </p>
      </div>
      
      <UForm :schema="schema" :state="state" @submit="onSubmit" class="mt-8 space-y-4 flex flex-col">
        <UFormField label="Email" name="email">
          <UInput v-model="state.email" type="email" placeholder="Enter your email" class="w-full" />
        </UFormField>

        <UFormField label="Password" name="password">
          <UInput v-model="state.password" type="password" placeholder="Enter your password" class="w-full" />
        </UFormField>

        <UButton type="submit" block size="lg" :loading="loading">
          Sign in
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
  password: z.string().min(6, 'Password must be at least 6 characters')
})

type Schema = z.output<typeof schema>

const state = reactive({
  email: '',
  password: ''
})

const loading = ref(false)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  
  try {
    const { error } = await client.auth.signInWithPassword({
      email: event.data.email,
      password: event.data.password
    })
    
    if (error) throw error
    
    await router.push('/persons')
  } catch (error: any) {
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to sign in',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>