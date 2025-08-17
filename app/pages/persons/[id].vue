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
    <div v-else-if="!person" class="text-center py-8">
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
          <h1 class="text-2xl font-bold text-[var(--ui-text)]">{{ person.name }}</h1>
          <p class="mt-1 text-sm text-[var(--ui-text-muted)]">
            Added {{ formatDate(person.createdAt) }}
          </p>
        </div>
        <div class="flex gap-2">
          <UButton
            icon="i-heroicons-pencil"
            size="sm"
            @click="openEditPersonModal"
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
            <p class="mt-1 text-[var(--ui-text)]">{{ person.name }}</p>
          </div>
          
          <div v-if="person.address">
            <label class="text-sm font-medium text-[var(--ui-text-muted)]">Address</label>
            <p class="mt-1 text-[var(--ui-text)] whitespace-pre-wrap">{{ person.address }}</p>
          </div>
          
          <div v-if="person.notes">
            <label class="text-sm font-medium text-[var(--ui-text-muted)]">Notes</label>
            <p class="mt-1 text-[var(--ui-text)] whitespace-pre-wrap">{{ person.notes }}</p>
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
            @click="openAddVisitModal"
          >
            Add Visit
          </UButton>
        </div>

        <!-- Visits List -->
        <div v-if="visits && visits.length > 0" class="space-y-3">
          <UCard v-for="visit in visits" :key="visit.id">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <p class="font-medium text-[var(--ui-text)]">
                  {{ formatDateTime(visit.visitedAt) }}
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
      :open="showEditPersonModal"
      :person="person"
      :loading="isEditing"
      @submit="handleEdit"
      @close="closeModal"
    />

    <!-- Add Visit Modal -->
    <VisitAddModal
      :open="showAddVisitModal"
      :loading="isAddingVisit"
      @submit="handleAddVisit"
      @close="closeModal"
    />

    <!-- Edit Visit Modal -->
    <VisitEditModal
      :open="showEditVisitModal"
      :visit="selectedVisit"
      :loading="isEditingVisit"
      @submit="handleEditVisit"
      @close="closeModal"
    />

    <!-- Realtime Status Indicator -->
    <RealtimeStatus 
      :state="combinedRealtimeState" 
      :reconnect="reconnectRealtime" 
    />
  </div>
</template>

<script setup lang="ts">
import type { VisitFormData, PersonFormData } from '../../../shared/validation/personSchemas'

type Person = {
  id: string
  userId: string
  name: string
  address: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

type Visit = {
  id: string
  personId: string
  userId: string
  visitedAt: string
  notes: string | null
  createdAt: string
}

const route = useRoute()
const toast = useToast()
const personId = route.params.id as string

// Modal state management
const modalConfig = {
  allowedModals: ['edit-person', 'add-visit', 'edit-visit'] as const,
  paramKeys: ['visitId'] as const
}

const { getParam, isModalOpen, openModal, closeModal } = useModalState(modalConfig)

// Specific modal state
const showEditPersonModal = isModalOpen('edit-person')
const showAddVisitModal = isModalOpen('add-visit')
const showEditVisitModal = isModalOpen('edit-visit')
const visitId = getParam('visitId')

// Convenience functions
const openEditPersonModal = () => openModal('edit-person')
const openAddVisitModal = () => openModal('add-visit')
const openEditVisitModal = (visitId: string) => openModal('edit-visit', { visitId })

// Selected visit computed from URL visitId
const selectedVisit = computed(() => {
  if (!visitId.value || !visits.value) return null
  return visits.value.find(visit => visit.id === visitId.value) || null
})

// Loading states
const isEditing = ref(false)
const isAddingVisit = ref(false)
const isEditingVisit = ref(false)

// Use realtime item for person data
const {
  item: person,
  pending,
  error,
  realtimeState: personRealtimeState,
  reconnect: reconnectPerson
} = useRealtimeItem<Person>({
  table: 'persons',
  id: personId,
  apiEndpoint: `/api/persons/${personId}`,
  onDeleted: () => navigateTo('/persons')
})

// Use realtime list for visits
const {
  items: visits,
  realtimeState: visitsRealtimeState,
  reconnect: reconnectVisits
} = useRealtimeList({
  table: 'visits',
  apiEndpoint: `/api/persons/${personId}/visits`,
  filter: `person_id=eq.${personId}`,
  sortBy: 'visitedAt',
  sortOrder: 'desc'
})

// Combined realtime state and reconnect
const combinedRealtimeState = computed(() => ({
  isConnected: personRealtimeState.isConnected && visitsRealtimeState.isConnected,
  isSubscribed: personRealtimeState.isSubscribed && visitsRealtimeState.isSubscribed,
  error: personRealtimeState.error || visitsRealtimeState.error,
  connectionStatus: (personRealtimeState.error || visitsRealtimeState.error) 
    ? 'ERROR' as const
    : personRealtimeState.connectionStatus
}))

const reconnectRealtime = () => {
  reconnectPerson()
  reconnectVisits()
}


// Format functions
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    return 'Invalid Date'
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    return 'Invalid Date'
  }
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}


// Person actions
async function handleEdit(data: PersonFormData) {
  if (!person.value) return
  
  isEditing.value = true
  
  try {
    await $fetch(`/api/persons/${personId}`, {
      method: 'PUT',
      body: data
    })
    
    closeModal()
    toast.add({
      title: 'Success',
      description: 'Person updated successfully'
    })
  } catch {
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
async function handleAddVisit(data: VisitFormData) {
  isAddingVisit.value = true
  
  try {
    await $fetch(`/api/persons/${personId}/visits`, {
      method: 'POST',
      body: data
    })
    
    closeModal()
    
    toast.add({
      title: 'Success',
      description: 'Visit added successfully'
    })
  } catch {
    toast.add({
      title: 'Error',
      description: 'Failed to add visit',
      color: 'error'
    })
  } finally {
    isAddingVisit.value = false
  }
}

async function handleEditVisit(data: VisitFormData & { id: string }) {
  isEditingVisit.value = true
  
  try {
    await $fetch(`/api/visits/${data.id}`, {
      method: 'PUT',
      body: { visitedAt: data.visitedAt, notes: data.notes }
    })
    
    closeModal()
    toast.add({
      title: 'Success',
      description: 'Visit updated successfully'
    })
  } catch {
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
  
  try {
    await $fetch(`/api/visits/${id}`, {
      method: 'DELETE'
    })
    
    toast.add({
      title: 'Success',
      description: 'Visit deleted successfully'
    })
  } catch {
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
    onSelect: () => openEditVisitModal(visit.id)
  }],
  [{
    label: 'Delete',
    icon: 'i-heroicons-trash',
    onSelect: () => handleDeleteVisit(visit.id)
  }]
]
</script>