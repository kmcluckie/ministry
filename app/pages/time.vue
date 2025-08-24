<template>
  <div class="p-4">
    <div class="mb-4 flex flex-row gap-3 items-start items-center justify-between">
      <USelect
        v-model="selectedTypes"
        :items="typeOptions"
        multiple
        placeholder="Type"
        class="grow sm:w-40"
        @change="applyFilters"
      />
      <UButton 
        icon="i-heroicons-plus" 
        @click="openAddTimeModal"
      >
        Add Time
      </UButton>
    </div>

    <!-- Summary -->
    <div v-if="times && times.length > 0" class="mb-6 grid grid-cols-2 gap-4">
      <div class="rounded-lg border border-[var(--ui-border)] p-4">
        <div class="text-2xl font-bold text-[var(--ui-text)]">{{ lastMonthHours }}</div>
        <div class="text-sm text-[var(--ui-text-muted)]">Last Month</div>
      </div>
      <div class="rounded-lg border border-[var(--ui-border)] p-4">
        <div class="text-2xl font-bold text-[var(--ui-text)]">{{ thisMonthHours }}</div>
        <div class="text-sm text-[var(--ui-text-muted)]">This Month</div>
      </div>
    </div>
    
    <div v-if="pending" class="flex justify-center py-8">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin h-6 w-6 text-[var(--ui-text-muted)]" />
    </div>

    <div v-else-if="error" class="bg-[var(--ui-color-error-50)] border border-[var(--ui-color-error-200)] rounded-lg p-4">
      <p class="text-error">Error loading time records: {{ error.message }}</p>
    </div>

    <div v-else-if="!times || times.length === 0" class="rounded-lg border border-[var(--ui-border)] p-8 text-center">
      <UIcon name="i-heroicons-clock" class="h-12 w-12 text-[var(--ui-text-muted)] mx-auto mb-3" />
      <p class="text-[var(--ui-text-muted)]">
        {{ hasActiveFilters ? 'No time records found matching your filters' : 'No time records added yet' }}
      </p>
      <p class="text-sm text-[var(--ui-text-muted)] mt-2">
        {{ hasActiveFilters ? 'Try adjusting your filters' : 'Click "Add Time" to get started' }}
      </p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="time in times"
        :key="time.id"
        class="rounded-lg border border-[var(--ui-border)] p-4 hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3">
              <div class="text-sm font-medium px-2 py-1 rounded-md bg-[var(--ui-bg-elevated)] text-[var(--ui-text)]">
                {{ time.type }}
              </div>
              <div class="text-sm text-[var(--ui-text-muted)]">
                {{ formatDate(time.recordedOn) }}
              </div>
            </div>
            <div class="mt-2 text-lg font-semibold text-[var(--ui-text)]">
              {{ formatTime(time.hours, time.minutes) }}
            </div>
          </div>
          <UDropdownMenu :items="getTimeActions(time)">
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-heroicons-ellipsis-vertical"
              size="xs"
            />
          </UDropdownMenu>
        </div>
      </div>
    </div>

    <TimeAddModal
      :open="showAddTimeModal"
      :loading="isAdding"
      :available-types="availableTypes"
      @submit="handleAddTime"
      @close="closeModal"
    />

    <TimeEditModal
      :open="showEditTimeModal"
      :time-record="currentEditingTime"
      :loading="isEditing"
      :available-types="availableTypes"
      @submit="handleEditTime"
      @close="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import type { TimeFormData } from '../../shared/validation/timeSchemas'

type TimeRecord = {
  id: string
  type: string
  recordedOn: string
  hours: number
  minutes: number
  totalMinutes: number
  createdAt: string
  updatedAt: string
}

// Modal state management
const {
  showAddTimeModal, showEditTimeModal, timeId, closeModal,
  openAddTimeModal, openEditTimeModal
} = useModalState([
  { key: 'add-time' },
  { key: 'edit-time', params: ['timeId'] }
])

// Loading states
const isAdding = ref(false)
const isEditing = ref(false)

// Filter states
const selectedTypes = ref<string[]>([])

// Data
const times = ref<TimeRecord[]>([])
const availableTypes = ref<string[]>([])
const pending = ref(false)
const error = ref<Error | null>(null)

// Current editing time computed from URL timeId
const currentEditingTime = computed(() => {
  if (!timeId.value || !times.value) return null
  return times.value.find(time => time.id === timeId.value) || null
})

// Filter options
const typeOptions = computed(() => {
  return availableTypes.value.map(type => ({
    label: type,
    value: type
  }))
})


// Filter status
const hasActiveFilters = computed(() => {
  return selectedTypes.value.length > 0
})

// Summary calculations
const lastMonthHours = computed(() => {
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
  
  const filteredTimes = times.value.filter(time => {
    const recordDate = new Date(time.recordedOn + 'T00:00:00.000Z')
    return recordDate >= lastMonth && recordDate <= lastMonthEnd
  })
  
  const totalMinutes = filteredTimes.reduce((sum, time) => sum + time.totalMinutes, 0)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
})

const thisMonthHours = computed(() => {
  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  
  const filteredTimes = times.value.filter(time => {
    const recordDate = new Date(time.recordedOn + 'T00:00:00.000Z')
    return recordDate >= thisMonthStart && recordDate <= now
  })
  
  const totalMinutes = filteredTimes.reduce((sum, time) => sum + time.totalMinutes, 0)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
})


// Load data
async function loadTimes() {
  pending.value = true
  error.value = null
  
  try {
    const params = new URLSearchParams()
    
    if (selectedTypes.value.length > 0) {
      selectedTypes.value.forEach(type => params.append('type', type))
    }
    
    const url = `/api/times${params.toString() ? '?' + params.toString() : ''}`
    times.value = await $fetch(url)
  } catch (err) {
    error.value = err as Error
  } finally {
    pending.value = false
  }
}

async function loadAvailableTypes() {
  try {
    console.log('Loading available types...')
    availableTypes.value = await $fetch('/api/time-types')
    console.log('Loaded available types:', availableTypes.value)
  } catch (err) {
    console.error('Failed to load available types:', err)
  }
}

// Filter actions
function applyFilters() {
  loadTimes()
}


// Formatters
const formatDate = (dateString: string) => {
  return new Date(dateString + 'T00:00:00.000Z').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatTime = (hours: number, minutes: number) => {
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

// Actions
const getTimeActions = (time: TimeRecord) => [
  [{
    label: 'Edit',
    icon: 'i-heroicons-pencil',
    onSelect: () => openEditTimeModal({ timeId: time.id })
  }],
  [{
    label: 'Delete',
    icon: 'i-heroicons-trash',
    onSelect: () => handleDeleteTime(time.id)
  }]
]

async function handleAddTime(data: TimeFormData) {
  isAdding.value = true
  
  try {
    await $fetch('/api/times', {
      method: 'POST',
      body: data
    })
    
    closeModal()
    await loadTimes()
    await loadAvailableTypes() // Refresh types in case new one was added
    
    const toast = useToast()
    toast.add({
      title: 'Success',
      description: 'Time record added successfully'
    })
  } catch {
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: 'Failed to add time record',
      color: 'error'
    })
  } finally {
    isAdding.value = false
  }
}

async function handleEditTime(data: TimeFormData) {
  if (!currentEditingTime.value) return
  
  isEditing.value = true
  const timeId = currentEditingTime.value.id
  
  try {
    await $fetch(`/api/times/${timeId}`, {
      method: 'PUT',
      body: data
    })
    
    closeModal()
    await loadTimes()
    await loadAvailableTypes() // Refresh types in case new one was added
    
    const toast = useToast()
    toast.add({
      title: 'Success',
      description: 'Time record updated successfully'
    })
  } catch {
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: 'Failed to update time record',
      color: 'error'
    })
  } finally {
    isEditing.value = false
  }
}

async function handleDeleteTime(id: string) {
  const confirmed = confirm('Are you sure you want to delete this time record?')
  
  if (!confirmed) return
  
  try {
    await $fetch(`/api/times/${id}`, {
      method: 'DELETE'
    })
    
    await loadTimes()
    
    const toast = useToast()
    toast.add({
      title: 'Success',
      description: 'Time record deleted successfully'
    })
  } catch {
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: 'Failed to delete time record',
      color: 'error'
    })
  }
}

// Initialize data on mount
onMounted(() => {
  loadTimes()
  loadAvailableTypes()
})
</script>
