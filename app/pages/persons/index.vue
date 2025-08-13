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
          Added {{ formatDate(person.created_at) }}
        </div>
      </div>
    </div>

    <UModal v-model:open="showAddModal">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Add New Person</h3>
          </template>

          <UForm :state="newPerson" @submit="handleAddPerson" class="space-y-4">
            <UFormField name="name" label="Name" required>
              <UInput
                v-model="newPerson.name"
                placeholder="Enter person's name"
                class="w-full"
              />
            </UFormField>

            <UFormField name="address" label="Address">
              <UTextarea
                v-model="newPerson.address"
                placeholder="Enter address (optional)"
                :rows="2"
                class="w-full"
              />
            </UFormField>

            <UFormField name="notes" label="Notes">
              <UTextarea
                v-model="newPerson.notes"
                placeholder="Add any notes (optional)"
                :rows="3"
                maxlength="2000"
                class="w-full"
              />
            </UFormField>

            <div class="flex justify-end gap-3">
              <UButton
                color="neutral"
                variant="ghost"
                @click="showAddModal = false"
              >
                Cancel
              </UButton>
              <UButton
                type="submit"
                :loading="isAdding"
              >
                Add Person
              </UButton>
            </div>
          </UForm>
        </UCard>
      </template>
    </UModal>

    <UModal v-model:open="showEditModal">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Edit Person</h3>
          </template>

          <UForm :state="editingPerson" @submit="handleEditPerson" class="space-y-4">
            <UFormField name="name" label="Name" required>
              <UInput
                v-model="editingPerson.name"
                placeholder="Enter person's name"
                class="w-full"
              />
            </UFormField>

            <UFormField name="address" label="Address">
              <UTextarea
                v-model="editingPerson.address"
                placeholder="Enter address (optional)"
                :rows="2"
                class="w-full"
              />
            </UFormField>

            <UFormField name="notes" label="Notes">
              <UTextarea
                v-model="editingPerson.notes"
                placeholder="Add any notes (optional)"
                :rows="3"
                maxlength="2000"
                class="w-full"
              />
            </UFormField>

            <div class="flex justify-end gap-3">
              <UButton
                color="neutral"
                variant="ghost"
                @click="showEditModal = false"
              >
                Cancel
              </UButton>
              <UButton
                type="submit"
                :loading="isEditing"
              >
                Save Changes
              </UButton>
            </div>
          </UForm>
        </UCard>
      </template>
    </UModal>
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

const newPerson = reactive({
  name: '',
  address: '',
  notes: ''
})

const editingPerson = reactive({
  id: '',
  name: '',
  address: '',
  notes: ''
})

const { data: persons, pending, error, refresh } = await useFetch<Person[]>('/api/persons', {
  query: {
    search: searchQuery
  },
  watch: [searchQuery]
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
      Object.assign(editingPerson, {
        id: person.id,
        name: person.name,
        address: person.address || '',
        notes: person.notes || ''
      })
      showEditModal.value = true
    }
  }],
  [{
    label: 'Delete',
    icon: 'i-heroicons-trash',
    onSelect: () => handleDeletePerson(person.id)
  }]
]

async function handleAddPerson() {
  isAdding.value = true
  try {
    await $fetch<any>('/api/persons', {
      method: 'POST',
      body: newPerson
    })
    
    showAddModal.value = false
    Object.assign(newPerson, {
      name: '',
      address: '',
      notes: ''
    })
    
    await refresh()
    
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

async function handleEditPerson() {
  isEditing.value = true
  try {
    await $fetch<any>(`/api/persons/${editingPerson.id}`, {
      method: 'PUT',
      body: {
        name: editingPerson.name,
        address: editingPerson.address,
        notes: editingPerson.notes
      }
    })
    
    showEditModal.value = false
    await refresh()
    
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
    await $fetch<any>(`/api/persons/${id}`, {
      method: 'DELETE'
    })
    
    await refresh()
    
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