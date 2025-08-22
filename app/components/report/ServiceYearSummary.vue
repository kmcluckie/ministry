<template>
  <div class="rounded-lg border border-[var(--ui-border)] p-4 bg-[var(--ui-bg-elevated)]">
    <div class="text-center text-lg font-semibold text-[var(--ui-text)] mb-4">
      {{ serviceYear }} Service Year Summary
    </div>
    
    <div class="grid grid-cols-2 gap-4">
      <div class="text-center">
        <div class="text-xl font-bold text-[var(--ui-text)]">{{ totalHours }}</div>
        <div class="text-sm text-[var(--ui-text-muted)]">Total Hours</div>
      </div>
      
      <div class="text-center">
        <div class="text-xl font-bold text-[var(--ui-text)]">{{ averageHoursRemaining }}</div>
        <div class="text-sm text-[var(--ui-text-muted)]">Avg/Month Needed</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Report } from '../../../types/ministry.types'

type Props = {
  serviceYear: number
  reports: Report[]
  goalHours?: number
}

const props = withDefaults(defineProps<Props>(), {
  goalHours: 600 // Default annual goal
})

// Computed values
const totalHours = computed(() => {
  return props.reports.reduce((sum, report) => sum + report.totalHours, 0)
})

const monthsRemaining = computed(() => {
  const currentDate = new Date()
  const currentServiceYear = currentDate.getMonth() < 8 
    ? currentDate.getFullYear() - 1 
    : currentDate.getFullYear()
  
  if (props.serviceYear !== currentServiceYear) return 0
  
  const serviceYearEnd = new Date(props.serviceYear + 1, 7, 31) // August 31st
  const monthsLeft = Math.max(0, Math.ceil((serviceYearEnd.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24 * 30)))
  return Math.min(12, monthsLeft)
})

const averageHoursRemaining = computed(() => {
  if (monthsRemaining.value === 0) return '0h'
  const hoursLeft = Math.max(0, props.goalHours - totalHours.value)
  const averageNeeded = hoursLeft / monthsRemaining.value
  return `${Math.round(averageNeeded)}h`
})
</script>