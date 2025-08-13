<template>
  <div class="max-w-7xl mx-auto p-4">
    <div class="mb-4 flex gap-3 items-center">
      <UInput
        v-model="searchQuery"
        icon="i-heroicons-magnifying-glass"
        placeholder="Search persons..."
        class="flex-1"
        @input="debouncedSearch"
      />
      <UButton 
        icon="i-heroicons-plus" 
        @click="showAddModal = true"
      >
        Add Person
      </UButton>
    </div>
    
    <div v-if="pending" class="flex justify-center py-8">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin h-6 w-6 text-[var(--ui-text-muted)]" />
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-600">Error loading persons: {{ error.message }}</p>
    </div>

    <div v-else-if="!localPersons || localPersons.length === 0" class="rounded-lg border border-[var(--ui-border)] p-8 text-center">
      <UIcon name="i-heroicons-user-group" class="h-12 w-12 text-[var(--ui-text-muted)] mx-auto mb-3" />
      <p class="text-[var(--ui-text-muted)]">
        {{ searchQuery ? 'No persons found matching your search' : 'No persons added yet' }}
      </p>
      <p class="text-sm text-[var(--ui-text-muted)] mt-2">
        {{ searchQuery ? 'Try a different search term' : 'Click "Add Person" to get started' }}
      </p>
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="person in localPersons"
        :key="person.id"
        class="rounded-lg border border-[var(--ui-border)] p-4 hover:shadow-md transition-shadow cursor-pointer"
        @click="navigateTo(`/persons/${person.id}`)"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h3 class="font-semibold text-[var(--ui-text)]">{{ person.name }}</h3>
            <p v-if="person.address" class="text-sm text-[var(--ui-text-muted)] mt-1">
              {{ person.address }}
            </p>
            <p v-if="person.notes" class="text-sm text-[var(--ui-text-muted)] mt-2 line-clamp-2">
              {{ person.notes }}
            </p>
          </div>
          <UDropdownMenu :items="getPersonActions(person)">
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-heroicons-ellipsis-vertical"
              size="xs"
              @click.stop
            />
          </UDropdownMenu>
        </div>
        <USeparator class="my-3" />
        <div class="flex items-center text-xs text-[var(--ui-text-muted)]">
          <UIcon name="i-heroicons-calendar" class="h-3 w-3 mr-1" />
          Added {{ formatDate(person.created_at) }}
        </div>
      </div>
    </div>

    <PersonAddModal
      v-model:open="showAddModal"
      :loading="isAdding"
      @submit="handleAddPerson"
    />

    <PersonEditModal
      v-model:open="showEditModal"
      :person="currentEditingPerson"
      :loading="isEditing"
      @submit="handleEditPerson"
    />

    <!-- Realtime Status Indicator -->
    <RealtimeStatus 
      :state="realtimeState" 
      :reconnect="reconnectRealtime" 
    />
  </div>
</template>

<script setup lang="ts">
import { debounce } from 'lodash-es'

type Person = {
  id: string
  user_id: string
  name: string
  address: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

const searchQuery = ref('')
const showAddModal = ref(false)
const showEditModal = ref(false)
const isAdding = ref(false)
const isEditing = ref(false)

const currentEditingPerson = ref<Person | null>(null)

const { data: persons, pending, error, refresh } = await useFetch<Person[]>('/api/persons', {
  query: {
    search: searchQuery
  },
  watch: [searchQuery]
})

// Create a reactive local copy of persons for realtime updates
const localPersons = ref<Person[]>(persons.value || [])

// Watch for changes from useFetch and update local copy
watch(persons, (newPersons) => {
  if (newPersons) {
    localPersons.value = [...newPersons]
  }
}, { immediate: true })

// Set up realtime subscription for persons table
const { state: realtimeState, reconnect: reconnectRealtime } = useRealtimeSubscription({
  table: 'persons',
  onInsert: (payload) => {
    const newPerson = payload.new as Person
    
    // Remove any temporary entry with the same data (optimistic updates)
    const tempIndex = localPersons.value.findIndex(p => 
      p.id.startsWith('temp-') && 
      p.name === newPerson.name && 
      p.address === newPerson.address
    )
    if (tempIndex !== -1) {
      localPersons.value.splice(tempIndex, 1)
    }
    
    // Only add if not already in the list and matches current search
    if (!localPersons.value.find(p => p.id === newPerson.id)) {
      // If there's a search query, check if the new person matches
      if (!searchQuery.value || newPerson.name.toLowerCase().includes(searchQuery.value.toLowerCase())) {
        localPersons.value = [...localPersons.value, newPerson].sort((a, b) => a.name.localeCompare(b.name))
      }
    }
  },
  onUpdate: (payload) => {
    const updatedPerson = payload.new as Person
    const index = localPersons.value.findIndex(p => p.id === updatedPerson.id)
    if (index !== -1) {
      // Check if updated person still matches search criteria
      if (!searchQuery.value || updatedPerson.name.toLowerCase().includes(searchQuery.value.toLowerCase())) {
        localPersons.value[index] = updatedPerson
        // Re-sort the list
        localPersons.value = [...localPersons.value].sort((a, b) => a.name.localeCompare(b.name))
      } else {
        // Remove from list if it no longer matches search
        localPersons.value = localPersons.value.filter(p => p.id !== updatedPerson.id)
      }
    } else if (!searchQuery.value || updatedPerson.name.toLowerCase().includes(searchQuery.value.toLowerCase())) {
      // Add to list if it now matches and wasn't there before
      localPersons.value = [...localPersons.value, updatedPerson].sort((a, b) => a.name.localeCompare(b.name))
    }
  },
  onDelete: (payload) => {
    const deletedPerson = payload.old as Person
    localPersons.value = localPersons.value.filter(p => p.id !== deletedPerson.id)
  },
  onError: (error) => {
    console.error('Realtime subscription error:', error)
  }
})

const debouncedSearch = debounce(() => {
  refresh()
}, 300)

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const getPersonActions = (person: Person) => [
  [{
    label: 'View Details',
    icon: 'i-heroicons-eye',
    to: `/persons/${person.id}`
  }],
  [{
    label: 'Edit',
    icon: 'i-heroicons-pencil',
    onSelect: () => {
      currentEditingPerson.value = person
      showEditModal.value = true
    }
  }],
  [{
    label: 'Delete',
    icon: 'i-heroicons-trash',
    onSelect: () => handleDeletePerson(person.id)
  }]
]

async function handleAddPerson(data: { name: string; address: string; notes: string }) {
  isAdding.value = true
  
  // Optimistic update: Add temporary person to the list immediately
  const tempId = `temp-${Date.now()}`
  const tempPerson: Person = {
    id: tempId,
    user_id: '', // Will be set by server
    name: data.name,
    address: data.address || null,
    notes: data.notes || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  // Add to local list with optimistic flag (using array spread to trigger reactivity)
  localPersons.value = [...localPersons.value, tempPerson].sort((a, b) => a.name.localeCompare(b.name))
  showAddModal.value = false
  
  try {
    await $fetch('/api/persons', {
      method: 'POST',
      body: data
    })
    
    const toast = useToast()
    toast.add({
      title: 'Success',
      description: 'Person added successfully'
    })
    // Note: Realtime will replace the temp person with the real one from server
  } catch {
    // Revert optimistic update on error
    localPersons.value = localPersons.value.filter(p => p.id !== tempId)
    
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: 'Failed to add person',
      color: 'error'
    })
  } finally {
    isAdding.value = false
  }
}

async function handleEditPerson(data: { name: string; address: string; notes: string }) {
  if (!currentEditingPerson.value) return
  
  isEditing.value = true
  const originalPerson = { ...currentEditingPerson.value }
  
  // Optimistic update: Update person in the list immediately
  const index = localPersons.value.findIndex(p => p.id === currentEditingPerson.value!.id)
  if (index !== -1) {
    const updatedPerson = {
      ...localPersons.value[index],
      name: data.name,
      address: data.address || null,
      notes: data.notes || null,
      updated_at: new Date().toISOString()
    }
    localPersons.value[index] = updatedPerson
    // Re-sort the list
    localPersons.value = [...localPersons.value].sort((a, b) => a.name.localeCompare(b.name))
  }
  
  showEditModal.value = false
  currentEditingPerson.value = null
  
  try {
    await $fetch(`/api/persons/${originalPerson.id}`, {
      method: 'PUT',
      body: data
    })
    
    const toast = useToast()
    toast.add({
      title: 'Success',
      description: 'Person updated successfully'
    })
    // Note: Realtime will confirm the update with server data
  } catch {
    // Revert optimistic update on error
    if (index !== -1) {
      localPersons.value[index] = originalPerson
      localPersons.value = [...localPersons.value].sort((a, b) => a.name.localeCompare(b.name))
    }
    
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: 'Failed to update person',
      color: 'error'
    })
  } finally {
    isEditing.value = false
  }
}

async function handleDeletePerson(id: string) {
  const confirmed = confirm('Are you sure you want to delete this person? This will also delete all associated visits.')
  
  if (!confirmed) return
  
  // Find the person to delete for potential restoration
  const personToDelete = localPersons.value.find(p => p.id === id)
  if (!personToDelete) return
  
  // Optimistic update: Remove person from list immediately
  localPersons.value = localPersons.value.filter(p => p.id !== id)
  
  try {
    await $fetch(`/api/persons/${id}`, {
      method: 'DELETE'
    })
    
    const toast = useToast()
    toast.add({
      title: 'Success',
      description: 'Person deleted successfully'
    })
    // Note: Realtime will confirm the deletion
  } catch {
    // Revert optimistic update on error
    localPersons.value = [...localPersons.value, personToDelete].sort((a, b) => a.name.localeCompare(b.name))
    
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: 'Failed to delete person',
      color: 'error'
    })
  }
}
</script>