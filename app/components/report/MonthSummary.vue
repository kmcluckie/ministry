<template>
  <div class="rounded-lg border border-[var(--ui-border)] p-4">
    <div class="text-sm font-medium text-[var(--ui-text)] mb-3">
      Time Records for {{ monthName }} {{ year }}
    </div>
    
    <div v-if="timeRecords.length === 0" class="text-sm text-[var(--ui-text-muted)]">
      No time records for this month
    </div>
    
    <div v-else class="space-y-2">
      <div v-for="record in timeRecords" :key="record.type" class="flex justify-between text-sm">
        <span class="text-[var(--ui-text-muted)]">{{ record.type }}</span>
        <span class="text-[var(--ui-text)]">{{ formatTime(record.totalMinutes) }}</span>
      </div>
      
      <div class="border-t border-[var(--ui-border)] pt-2 flex justify-between text-sm font-medium">
        <span class="text-[var(--ui-text)]">Total</span>
        <span class="text-[var(--ui-text)]">{{ formatTime(totalMinutes) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type TimeRecordSummary = {
  type: string
  totalMinutes: number
}

type Props = {
  month: number
  year: number
  timeRecords: TimeRecordSummary[]
}

const props = defineProps<Props>()

// Month names
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Computed values
const monthName = computed(() => {
  return monthNames[props.month - 1] || ''
})

const totalMinutes = computed(() => {
  return props.timeRecords.reduce((sum, record) => sum + record.totalMinutes, 0)
})

// Helper functions
function formatTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}
</script>