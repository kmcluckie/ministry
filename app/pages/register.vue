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
      
      <UForm :schema="schema" :state="state" class="mt-8 space-y-4 flex flex-col" @submit="onSubmit">
        <UFormGroup label="Name" name="name">
          <UInput v-model="state.name" type="text" placeholder="Enter your name" class="w-full" />
        </UFormGroup>

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
import type { FormSubmitEvent } from '#ui/types'
import { registerSchema } from '../../shared/validation/authSchemas'

definePageMeta({
  layout: false
})

const router = useRouter()

const schema = registerSchema

type Schema = typeof registerSchema._output

const state = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: event.data
    })
    
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
      description: error.data?.message || error.message || 'Failed to create account',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>