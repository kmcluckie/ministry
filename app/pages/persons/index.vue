<template>
  <div class="max-w-7xl mx-auto p-4">
    <div class="mb-4 flex gap-3 items-center">
      <UInput
        v-model="searchQuery"
        icon="i-heroicons-magnifying-glass"
        placeholder="Search persons..."
        class="flex-1"
        @input="handleSearchInput"
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

    <div v-else-if="!persons || persons.length === 0" class="rounded-lg border border-[var(--ui-border)] p-8 text-center">
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
        v-for="person in persons"
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
          Added {{ formatDate(person.createdAt) }}
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
import type { PersonFormData } from '../../../shared/validation/personSchemas'

type Person = {
  id: string
  userId: string
  name: string
  address: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  visitCount: number
}

const showAddModal = ref(false)
const showEditModal = ref(false)
const isAdding = ref(false)
const isEditing = ref(false)

const currentEditingPerson = ref<Person | null>(null)

// Use the generic realtime list composable
const {
  items: persons,
  pending,
  error,
  searchQuery,
  setSearch,
  realtimeState,
  reconnect: reconnectRealtime
} = useRealtimeList({
  table: 'persons',
  apiEndpoint: '/api/persons',
  searchField: 'name',
  sortBy: 'name',
  sortOrder: 'asc'
})


const handleSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  setSearch(target.value)
}

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

async function handleAddPerson(data: PersonFormData) {
  isAdding.value = true
  
  try {
    await $fetch('/api/persons', {
      method: 'POST',
      body: data
    })
    
    showAddModal.value = false
    const toast = useToast()
    toast.add({
      title: 'Success',
      description: 'Person added successfully'
    })
  } catch {
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

async function handleEditPerson(data: PersonFormData) {
  if (!currentEditingPerson.value) return
  
  isEditing.value = true
  const personId = currentEditingPerson.value.id
  
  try {
    await $fetch(`/api/persons/${personId}`, {
      method: 'PUT',
      body: data
    })
    
    showEditModal.value = false
    currentEditingPerson.value = null
    const toast = useToast()
    toast.add({
      title: 'Success',
      description: 'Person updated successfully'
    })
  } catch {
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
  
  try {
    await $fetch(`/api/persons/${id}`, {
      method: 'DELETE'
    })
    
    const toast = useToast()
    toast.add({
      title: 'Success',
      description: 'Person deleted successfully'
    })
  } catch {
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: 'Failed to delete person',
      color: 'error'
    })
  }
}
</script>