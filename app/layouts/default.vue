<template>
  <div v-if="user" class="min-h-screen bg-[var(--ui-bg)]">
    <!-- Navigation Header -->
    <nav class="border-b border-[var(--ui-border)] px-4 py-3">
      <div class="max-w-2xl mx-auto flex justify-between items-center">
        <div class="flex items-center space-x-2 sm:space-x-8">          
          <div class="flex items-center space-x-2 sm:space-x-4">
            <!-- Navigation slot for page-specific navigation elements -->
            <slot name="navigation" />
            
            <div class="flex space-x-2 sm:space-x-4">
            <NuxtLink 
              to="/persons" 
              class="text-[var(--ui-text-muted)] hover:text-[var(--ui-primary)] px-2 sm:px-3 py-2 rounded-md text-sm font-medium"
              active-class="text-[var(--ui-primary)] bg-[var(--ui-primary)]/10"
            >
              Persons
            </NuxtLink>
            <NuxtLink 
              to="/time" 
              class="text-[var(--ui-text-muted)] hover:text-[var(--ui-primary)] px-2 sm:px-3 py-2 rounded-md text-sm font-medium"
              active-class="text-[var(--ui-primary)] bg-[var(--ui-primary)]/10"
            >
              Time
            </NuxtLink>
            </div>
          </div>
        </div>
        
        <div class="flex items-center">
          <UDropdownMenu :items="userMenuItems">
            <UButton 
              color="neutral"
              variant="ghost"
              icon="i-heroicons-user-circle"
              size="lg"
              class="text-[var(--ui-text-muted)]"
            />
          </UDropdownMenu>
        </div>
      </div>
    </nav>
    
    <!-- Main Content -->
    <main class="max-w-2xl mx-auto">
      <slot />
    </main>
  </div>
  
  <!-- Unauthenticated layout -->
  <div v-else>
    <slot />
  </div>
</template>

<script setup lang="ts">
const { user } = useSupabase()
const loading = ref(false)
const toast = useToast()

const userMenuItems = computed(() => [
  [{
    label: user.value?.email || 'User',
    icon: 'i-heroicons-envelope',
    type: 'label'
  }],
  [{
    label: 'Sign out',
    icon: 'i-heroicons-arrow-right-on-rectangle',
    onSelect: logout
  }]
])

async function logout() {
  loading.value = true
  const client = useSupabaseClient()
  
  try {
    const { error } = await client.auth.signOut()
    
    if (error) throw error
    
    toast.add({
      title: 'Success',
      description: 'You have been signed out',
      color: 'success'
    })
    
    await navigateTo('/login')
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to sign out'
    toast.add({
      title: 'Error',
      description: errorMessage,
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>