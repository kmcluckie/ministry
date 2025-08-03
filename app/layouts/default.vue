<template>
  <div v-if="user" class="min-h-screen bg-[var(--ui-bg)]">
    <!-- Navigation Header -->
    <nav class="bg-white border-b border-[var(--ui-border)] px-4 py-3">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <div class="flex items-center space-x-8">
          <h1 class="text-xl font-semibold text-[var(--ui-text)]">
            Ministry Tracker
          </h1>
          
          <div class="flex space-x-4">
            <NuxtLink 
              to="/persons" 
              class="text-[var(--ui-text-muted)] hover:text-[var(--ui-primary)] px-3 py-2 rounded-md text-sm font-medium"
              active-class="text-[var(--ui-primary)] bg-[var(--ui-primary)]/10"
            >
              Persons
            </NuxtLink>
            <NuxtLink 
              to="/time" 
              class="text-[var(--ui-text-muted)] hover:text-[var(--ui-primary)] px-3 py-2 rounded-md text-sm font-medium"
              active-class="text-[var(--ui-primary)] bg-[var(--ui-primary)]/10"
            >
              Time
            </NuxtLink>
          </div>
        </div>
        
        <div class="flex items-center space-x-4">
          <span class="text-sm text-[var(--ui-text-muted)]">
            {{ user.email }}
          </span>
          <UButton 
            @click="logout"
            color="neutral"
            variant="ghost"
            size="sm"
            :loading="loading"
          >
            Sign out
          </UButton>
        </div>
      </div>
    </nav>
    
    <!-- Main Content -->
    <main>
      <slot />
    </main>
  </div>
  
  <!-- Unauthenticated layout -->
  <div v-else>
    <slot />
  </div>
</template>

<script setup lang="ts">
const { client, user } = useSupabase()
const router = useRouter()
const loading = ref(false)

async function logout() {
  loading.value = true
  
  try {
    const { error } = await client.auth.signOut()
    
    if (error) throw error
    
    const toast = useToast()
    toast.add({
      title: 'Success',
      description: 'You have been signed out',
      color: 'success'
    })
    
    await router.push('/login')
  } catch (error: any) {
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to sign out',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>