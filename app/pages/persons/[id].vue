<template>
  <div class="max-w-4xl mx-auto py-6 px-4">
    <!-- Loading State -->
    <div v-if="pending" class="flex justify-center py-8">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin h-6 w-6 text-[var(--ui-text-muted)]" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-600">Error loading person: {{ error.message }}</p>
      <UButton class="mt-3" color="neutral" variant="ghost" @click="navigateTo('/persons')">
        Back to Persons
      </UButton>
    </div>

    <!-- Person Not Found -->
    <div v-else-if="!localPerson" class="text-center py-8">
      <UIcon name="i-heroicons-user-circle" class="h-12 w-12 text-[var(--ui-text-muted)] mx-auto mb-3" />
      <p class="text-[var(--ui-text-muted)]">Person not found</p>
      <UButton class="mt-3" color="neutral" variant="ghost" @click="navigateTo('/persons')">
        Back to Persons
      </UButton>
    </div>

    <!-- Person Details -->
    <div v-else>
      <!-- Header with Actions -->
      <div class="mb-6 flex justify-between items-start">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <UButton
              icon="i-heroicons-arrow-left"
              color="neutral"
              variant="ghost"
              size="sm"
              @click="navigateTo('/persons')"
            >
              Back
            </UButton>
          </div>
          <h1 class="text-2xl font-bold text-[var(--ui-text)]">{{ localPerson.name }}</h1>
          <p class="mt-1 text-sm text-[var(--ui-text-muted)]">
            Added {{ formatDate(localPerson.created_at) }}
          </p>
        </div>
        <div class="flex gap-2">
          <UButton
            icon="i-heroicons-pencil"
            size="sm"
            @click="showEditModal = true"
          >
            Edit
          </UButton>
          <UButton
            icon="i-heroicons-trash"
            color="error"
            variant="soft"
            size="sm"
            @click="handleDelete"
          >
            Delete
          </UButton>
        </div>
      </div>

      <!-- Person Information Card -->
      <UCard class="mb-6">
        <template #header>
          <h2 class="text-lg font-semibold">Information</h2>
        </template>
        
        <div class="space-y-4">
          <div>
            <label class="text-sm font-medium text-[var(--ui-text-muted)]">Name</label>
            <p class="mt-1 text-[var(--ui-text)]">{{ localPerson.name }}</p>
          </div>
          
          <div v-if="localPerson.address">
            <label class="text-sm font-medium text-[var(--ui-text-muted)]">Address</label>
            <p class="mt-1 text-[var(--ui-text)] whitespace-pre-wrap">{{ localPerson.address }}</p>
          </div>
          
          <div v-if="localPerson.notes">
            <label class="text-sm font-medium text-[var(--ui-text-muted)]">Notes</label>
            <p class="mt-1 text-[var(--ui-text)] whitespace-pre-wrap">{{ localPerson.notes }}</p>
          </div>
        </div>
      </UCard>

      <!-- Visits Section -->
      <div class="mb-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-[var(--ui-text)]">Visits</h2>
          <UButton
            icon="i-heroicons-plus"
            size="sm"
            @click="showAddVisitModal = true"
          >
            Add Visit
          </UButton>
        </div>

        <!-- Visits List -->
        <div v-if="localVisits && localVisits.length > 0" class="space-y-3">
          <UCard v-for="visit in localVisits" :key="visit.id">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <p class="font-medium text-[var(--ui-text)]">
                  {{ formatDateTime(visit.visited_at) }}
                </p>
                <p v-if="visit.notes" class="mt-1 text-sm text-[var(--ui-text-muted)]">
                  {{ visit.notes }}
                </p>
              </div>
              <UDropdownMenu :items="getVisitActions(visit)">
                <UButton
                  color="neutral"
                  variant="ghost"
                  icon="i-heroicons-ellipsis-vertical"
                  size="xs"
                />
              </UDropdownMenu>
            </div>
          </UCard>
        </div>
        
        <!-- No Visits -->
        <div v-else class="rounded-lg border border-[var(--ui-border)] p-8 text-center">
          <UIcon name="i-heroicons-calendar" class="h-8 w-8 text-[var(--ui-text-muted)] mx-auto mb-2" />
          <p class="text-[var(--ui-text-muted)]">No visits recorded yet</p>
        </div>
      </div>
    </div>

    <!-- Edit Person Modal -->
    <PersonEditModal
      v-model:open="showEditModal"
      :person="localPerson"
      :loading="isEditing"
      @submit="handleEdit"
    />

    <!-- Add Visit Modal -->
    <UModal v-model:open="showAddVisitModal">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Add Visit</h3>
          </template>

          <UForm :state="visitForm" @submit="handleAddVisit" class="space-y-4">
            <UFormField name="visited_at" label="Date & Time" required>
              <UInput
                v-model="visitForm.visited_at"
                type="datetime-local"
                required
                class="w-full"
              />
            </UFormField>

            <UFormField name="notes" label="Notes">
              <UTextarea
                v-model="visitForm.notes"
                placeholder="Add any notes about the visit (optional)"
                :rows="3"
                maxlength="2000"
                class="w-full"
              />
            </UFormField>

            <div class="flex justify-end gap-3">
              <UButton
                color="neutral"
                variant="ghost"
                @click="showAddVisitModal = false"
              >
                Cancel
              </UButton>
              <UButton
                type="submit"
                :loading="isAddingVisit"
              >
                Add Visit
              </UButton>
            </div>
          </UForm>
        </UCard>
      </template>
    </UModal>

    <!-- Edit Visit Modal -->
    <UModal v-model:open="showEditVisitModal">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Edit Visit</h3>
          </template>

          <UForm :state="editVisitForm" @submit="handleEditVisit" class="space-y-4">
            <UFormField name="visited_at" label="Date & Time" required>
              <UInput
                v-model="editVisitForm.visited_at"
                type="datetime-local"
                required
                class="w-full"
              />
            </UFormField>

            <UFormField name="notes" label="Notes">
              <UTextarea
                v-model="editVisitForm.notes"
                placeholder="Add any notes about the visit (optional)"
                :rows="3"
                maxlength="2000"
                class="w-full"
              />
            </UFormField>

            <div class="flex justify-end gap-3">
              <UButton
                color="neutral"
                variant="ghost"
                @click="showEditVisitModal = false"
              >
                Cancel
              </UButton>
              <UButton
                type="submit"
                :loading="isEditingVisit"
              >
                Save Changes
              </UButton>
            </div>
          </UForm>
        </UCard>
      </template>
    </UModal>

    <!-- Realtime Status Indicator -->
    <RealtimeStatus 
      :state="combinedRealtimeState" 
      :reconnect="reconnectRealtime" 
    />
  </div>
</template>

<script setup lang="ts">
type Person = {
  id: string
  user_id: string
  name: string
  address: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

type Visit = {
  id: string
  person_id: string
  user_id: string
  visited_at: string
  notes: string | null
  created_at: string
}

const route = useRoute()
const toast = useToast()
const personId = route.params.id as string

// Modal states
const showEditModal = ref(false)
const showAddVisitModal = ref(false)
const showEditVisitModal = ref(false)

// Loading states
const isEditing = ref(false)
const isAddingVisit = ref(false)
const isEditingVisit = ref(false)


const visitForm = reactive({
  visited_at: new Date().toISOString().slice(0, 16),
  notes: ''
})

const editVisitForm = reactive({
  id: '',
  visited_at: '',
  notes: ''
})

// Fetch person data
const { data: person, pending, error } = await useFetch<Person>(`/api/persons/${personId}`)

// Fetch visits
const { data: visits } = await useFetch<Visit[]>(`/api/persons/${personId}/visits`)

// Create reactive local copies for realtime updates
const localPerson = ref<Person | null>(person.value)
const localVisits = ref<Visit[]>(visits.value || [])

// Watch for changes from useFetch and update local copies
watch(person, (newPerson) => {
  if (newPerson) {
    localPerson.value = { ...newPerson }
  }
}, { immediate: true })

watch(visits, (newVisits) => {
  if (newVisits) {
    localVisits.value = [...newVisits]
  }
}, { immediate: true })

// Set up realtime subscription for this person
const { state: personRealtimeState, reconnect: reconnectPerson } = useRealtimeSubscription({
  table: 'persons',
  filter: `id=eq.${personId}`,
  onUpdate: (payload) => {
    const updatedPerson = payload.new as Person
    if (localPerson.value && updatedPerson.id === localPerson.value.id) {
      localPerson.value = updatedPerson
    }
  },
  onDelete: (payload) => {
    const deletedPerson = payload.old as Person
    if (localPerson.value && deletedPerson.id === localPerson.value.id) {
      // Person was deleted, navigate back to list
      navigateTo('/persons')
    }
  },
  onError: (error) => {
    console.error('Person realtime subscription error:', error)
  }
})

// Set up realtime subscription for visits of this person
const { state: visitsRealtimeState, reconnect: reconnectVisits } = useRealtimeSubscription({
  table: 'visits',
  filter: `person_id=eq.${personId}`,
  onInsert: (payload) => {
    const newVisit = payload.new as Visit
    if (newVisit.person_id === personId) {
      // Add to list and sort by visited_at (newest first)
      localVisits.value = [...localVisits.value, newVisit]
        .sort((a, b) => new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime())
    }
  },
  onUpdate: (payload) => {
    const updatedVisit = payload.new as Visit
    const index = localVisits.value.findIndex(v => v.id === updatedVisit.id)
    if (index !== -1) {
      localVisits.value[index] = updatedVisit
      // Re-sort the list
      localVisits.value = [...localVisits.value]
        .sort((a, b) => new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime())
    }
  },
  onDelete: (payload) => {
    const deletedVisit = payload.old as Visit
    localVisits.value = localVisits.value.filter(v => v.id !== deletedVisit.id)
  },
  onError: (error) => {
    console.error('Visits realtime subscription error:', error)
  }
})

// Combined reconnect function for both subscriptions
const reconnectRealtime = () => {
  reconnectPerson()
  reconnectVisits()
}

// Combined realtime state (show error if either has issues)
const combinedRealtimeState = computed(() => ({
  isConnected: personRealtimeState.isConnected && visitsRealtimeState.isConnected,
  isSubscribed: personRealtimeState.isSubscribed && visitsRealtimeState.isSubscribed,
  error: personRealtimeState.error || visitsRealtimeState.error,
  connectionStatus: (personRealtimeState.error || visitsRealtimeState.error) 
    ? 'ERROR' as const
    : personRealtimeState.connectionStatus
}))


// Format functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

// Convert datetime to input format
const toInputDateTime = (dateString: string) => {
  return new Date(dateString).toISOString().slice(0, 16)
}

// Person actions
async function handleEdit(data: { name: string; address: string; notes: string }) {
  if (!localPerson.value) return
  
  isEditing.value = true
  const originalPerson = { ...localPerson.value }
  
  // Optimistic update: Update person immediately
  localPerson.value = {
    ...localPerson.value,
    name: data.name,
    address: data.address || null,
    notes: data.notes || null,
    updated_at: new Date().toISOString()
  }
  
  showEditModal.value = false
  
  try {
    await $fetch(`/api/persons/${personId}`, {
      method: 'PUT',
      body: data
    })
    
    toast.add({
      title: 'Success',
      description: 'Person updated successfully'
    })
    // Note: Realtime will confirm the update with server data
  } catch {
    // Revert optimistic update on error
    localPerson.value = originalPerson
    
    toast.add({
      title: 'Error',
      description: 'Failed to update person',
      color: 'error'
    })
  } finally {
    isEditing.value = false
  }
}

async function handleDelete() {
  const confirmed = confirm('Are you sure you want to delete this person? This will also delete all associated visits.')
  
  if (!confirmed) return
  
  try {
    await $fetch(`/api/persons/${personId}`, {
      method: 'DELETE'
    })
    
    toast.add({
      title: 'Success',
      description: 'Person deleted successfully'
    })
    
    await navigateTo('/persons')
  } catch {
    toast.add({
      title: 'Error',
      description: 'Failed to delete person',
      color: 'error'
    })
  }
}

// Visit actions
async function handleAddVisit() {
  isAddingVisit.value = true
  
  // Optimistic update: Add temporary visit to the list immediately
  const tempId = `temp-${Date.now()}`
  const tempVisit: Visit = {
    id: tempId,
    person_id: personId,
    user_id: '', // Will be set by server
    visited_at: visitForm.visited_at,
    notes: visitForm.notes || null,
    created_at: new Date().toISOString()
  }
  
  // Add to local list and sort by visited_at (newest first)
  localVisits.value = [...localVisits.value, tempVisit]
    .sort((a, b) => new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime())
  
  showAddVisitModal.value = false
  const originalForm = { ...visitForm }
  visitForm.visited_at = new Date().toISOString().slice(0, 16)
  visitForm.notes = ''
  
  try {
    await $fetch(`/api/persons/${personId}/visits`, {
      method: 'POST',
      body: originalForm
    })
    
    toast.add({
      title: 'Success',
      description: 'Visit added successfully'
    })
    // Note: Realtime will replace the temp visit with the real one from server
  } catch {
    // Revert optimistic update on error
    localVisits.value = localVisits.value.filter(v => v.id !== tempId)
    
    toast.add({
      title: 'Error',
      description: 'Failed to add visit',
      color: 'error'
    })
  } finally {
    isAddingVisit.value = false
  }
}

async function handleEditVisit() {
  isEditingVisit.value = true
  
  // Find the visit to update
  const index = localVisits.value.findIndex(v => v.id === editVisitForm.id)
  const originalVisit = index !== -1 ? { ...localVisits.value[index] } : null
  
  if (index !== -1) {
    // Optimistic update: Update visit immediately
    localVisits.value[index] = {
      ...localVisits.value[index],
      visited_at: editVisitForm.visited_at,
      notes: editVisitForm.notes || null
    }
    // Re-sort the list
    localVisits.value = [...localVisits.value]
      .sort((a, b) => new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime())
  }
  
  showEditVisitModal.value = false
  
  try {
    await $fetch(`/api/visits/${editVisitForm.id}`, {
      method: 'PUT',
      body: {
        visited_at: editVisitForm.visited_at,
        notes: editVisitForm.notes
      }
    })
    
    toast.add({
      title: 'Success',
      description: 'Visit updated successfully'
    })
    // Note: Realtime will confirm the update with server data
  } catch {
    // Revert optimistic update on error
    if (index !== -1 && originalVisit) {
      localVisits.value[index] = originalVisit
      localVisits.value = [...localVisits.value]
        .sort((a, b) => new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime())
    }
    
    toast.add({
      title: 'Error',
      description: 'Failed to update visit',
      color: 'error'
    })
  } finally {
    isEditingVisit.value = false
  }
}

async function handleDeleteVisit(id: string) {
  const confirmed = confirm('Are you sure you want to delete this visit?')
  
  if (!confirmed) return
  
  // Find the visit to delete for potential restoration
  const visitToDelete = localVisits.value.find(v => v.id === id)
  if (!visitToDelete) return
  
  // Optimistic update: Remove visit from list immediately
  localVisits.value = localVisits.value.filter(v => v.id !== id)
  
  try {
    await $fetch(`/api/visits/${id}`, {
      method: 'DELETE'
    })
    
    toast.add({
      title: 'Success',
      description: 'Visit deleted successfully'
    })
    // Note: Realtime will confirm the deletion
  } catch {
    // Revert optimistic update on error
    localVisits.value = [...localVisits.value, visitToDelete]
      .sort((a, b) => new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime())
    
    toast.add({
      title: 'Error',
      description: 'Failed to delete visit',
      color: 'error'
    })
  }
}

// Get visit actions for dropdown
const getVisitActions = (visit: Visit) => [
  [{
    label: 'Edit',
    icon: 'i-heroicons-pencil',
    onSelect: () => {
      editVisitForm.id = visit.id
      editVisitForm.visited_at = toInputDateTime(visit.visited_at)
      editVisitForm.notes = visit.notes || ''
      showEditVisitModal.value = true
    }
  }],
  [{
    label: 'Delete',
    icon: 'i-heroicons-trash',
    onSelect: () => handleDeleteVisit(visit.id)
  }]
]
</script>