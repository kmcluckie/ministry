<template>
  <UForm :state="formData" :schema="reportFormSchema" class="space-y-4" @submit="handleSubmit">
    <div class="grid grid-cols-2 gap-4">
      <UFormField name="month" label="Month" required>
        <USelect
          v-model="formData.month"
          :items="monthOptions"
          placeholder="Select month"
          class="w-full"
        />
      </UFormField>

      <UFormField name="year" label="Year" required>
        <UInputNumber
          v-model="formData.year"
          :min="2000"
          :max="2100"
          :format-options="{ useGrouping: false }"
          placeholder="2024"
          class="w-full"
        />
      </UFormField>
    </div>

    <UFormField name="studies" label="Studies" required>
      <UInputNumber
        v-model="formData.studies"
        :min="0"
        placeholder="0"
        class="w-full"
      />
    </UFormField>

    <div class="grid grid-cols-2 gap-4">
      <UFormField name="ministryHours" label="Ministry Hours" required>
        <UInputNumber
          v-model="formData.ministryHours"
          :min="0"
          :max="744"
          placeholder="0"
          class="w-full"
        />
      </UFormField>

      <UFormField name="creditHours" label="Credit Hours" required>
        <UInputNumber
          v-model="formData.creditHours"
          :min="0"
          :max="744"
          placeholder="0"
          class="w-full"
        />
      </UFormField>
    </div>

    <!-- Total Hours Display -->
    <div class="rounded-lg border border-[var(--ui-border)] p-4 bg-[var(--ui-bg-elevated)]">
      <div class="text-sm text-[var(--ui-text-muted)]">Total Hours</div>
      <div class="text-2xl font-bold text-[var(--ui-text)]">{{ totalHours }}</div>
    </div>

    <!-- Time Record Summary for Month -->
    <div v-if="timeRecordSummary" class="rounded-lg border border-[var(--ui-border)] p-4">
      <div class="text-sm font-medium text-[var(--ui-text)] mb-3">Time Records for {{ monthName }} {{ formData.year }}</div>
      <div class="space-y-2">
        <div v-for="summary in timeRecordSummary" :key="summary.type" class="flex justify-between text-sm">
          <span class="text-[var(--ui-text-muted)]">{{ summary.type }}</span>
          <span class="text-[var(--ui-text)]">{{ formatTime(summary.totalMinutes) }}</span>
        </div>
        <div class="border-t border-[var(--ui-border)] pt-2 flex justify-between text-sm font-medium">
          <span class="text-[var(--ui-text)]">Total</span>
          <span class="text-[var(--ui-text)]">{{ formatTime(totalTimeMinutes) }}</span>
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-3">
      <UButton
        color="neutral"
        variant="ghost"
        @click="$emit('cancel')"
      >
        Cancel
      </UButton>
      <UButton
        type="submit"
        :loading="loading"
      >
        {{ submitLabel }}
      </UButton>
    </div>
  </UForm>
</template>

<script setup lang="ts">
import { reportFormSchema, type ReportFormData } from '../../../shared/validation/reportSchemas'
import type { FormSubmitEvent } from '@nuxt/ui'

type TimeRecordSummary = {
  type: string
  totalMinutes: number
}

type Props = {
  initialData?: {
    month?: number
    year?: number
    studies?: number
    ministryHours?: number
    creditHours?: number
  }
  submitLabel?: string
  loading?: boolean
}

type Emits = {
  submit: [data: ReportFormData]
  cancel: []
}

const props = withDefaults(defineProps<Props>(), {
  initialData: undefined,
  submitLabel: 'Save',
  loading: false
})

const emit = defineEmits<Emits>()

// Reactive time record summary
const timeRecordSummary = ref<TimeRecordSummary[]>([])
const isLoadingTimeRecords = ref(false)

// Form data
const formData = reactive<ReportFormData>({
  month: props.initialData?.month ?? new Date().getMonth() + 1,
  year: props.initialData?.year ?? new Date().getFullYear(),
  studies: props.initialData?.studies ?? 0,
  ministryHours: props.initialData?.ministryHours ?? 0,
  creditHours: props.initialData?.creditHours ?? 0
})

// Month options
const monthOptions = [
  { label: 'January', value: 1 },
  { label: 'February', value: 2 },
  { label: 'March', value: 3 },
  { label: 'April', value: 4 },
  { label: 'May', value: 5 },
  { label: 'June', value: 6 },
  { label: 'July', value: 7 },
  { label: 'August', value: 8 },
  { label: 'September', value: 9 },
  { label: 'October', value: 10 },
  { label: 'November', value: 11 },
  { label: 'December', value: 12 }
]

// Computed values
const totalHours = computed(() => {
  return formData.ministryHours + formData.creditHours
})

const monthName = computed(() => {
  const month = monthOptions.find(m => m.value === formData.month)
  return month?.label || ''
})

const totalTimeMinutes = computed(() => {
  if (!timeRecordSummary.value) return 0
  return timeRecordSummary.value.reduce((sum, record) => sum + record.totalMinutes, 0)
})

// Functions
async function fetchTimeRecords(month: number, year: number) {
  if (!month || !year) return
  
  isLoadingTimeRecords.value = true
  
  try {
    const params = new URLSearchParams()
    params.append('year', year.toString())
    params.append('month', month.toString())
    
    const timeRecords = await $fetch(`/api/times?${params.toString()}`)
    
    // Group by type and calculate totals
    const summary: TimeRecordSummary[] = []
    const typeGroups: Record<string, number> = {}
    
    timeRecords.forEach((record: { type: string; totalMinutes: number }) => {
      if (!typeGroups[record.type]) {
        typeGroups[record.type] = 0
      }
      typeGroups[record.type] += record.totalMinutes || 0
    })
    
    Object.entries(typeGroups).forEach(([type, totalMinutes]) => {
      summary.push({ type, totalMinutes })
    })
    
    timeRecordSummary.value = summary
  } catch (error) {
    console.error('Failed to fetch time records:', error)
    timeRecordSummary.value = []
  } finally {
    isLoadingTimeRecords.value = false
  }
}

// Watchers
watch(() => props.initialData, (newData) => {
  if (newData) {
    formData.month = newData.month ?? new Date().getMonth() + 1
    formData.year = newData.year ?? new Date().getFullYear()
    formData.studies = newData.studies ?? 0
    formData.ministryHours = newData.ministryHours ?? 0
    formData.creditHours = newData.creditHours ?? 0
  }
}, { immediate: true, deep: true })

// Watch for month/year changes and fetch time records
watch([() => formData.month, () => formData.year], ([month, year]) => {
  fetchTimeRecords(month, year)
}, { immediate: true })

// Auto-prefill ministry and credit hours for new reports when time records are loaded
watch(timeRecordSummary, (newSummary) => {
  // Only auto-prefill if this is a new report (no initial ministry hours provided)
  // and we have time records with data
  if (props.initialData?.ministryHours === undefined && newSummary && newSummary.length > 0) {
    const ministryRecord = newSummary.find(record => record.type === 'Ministry')
    const nonMinistryRecords = newSummary.filter(record => record.type !== 'Ministry')
    
    // Calculate ministry hours
    const ministryHours = ministryRecord ? Math.floor(ministryRecord.totalMinutes / 60) : 0
    formData.ministryHours = ministryHours
    
    // Calculate credit hours (sum of all non-ministry time, capped to keep total <= 55)
    const totalNonMinistryMinutes = nonMinistryRecords.reduce((sum, record) => sum + record.totalMinutes, 0)
    const totalNonMinistryHours = Math.floor(totalNonMinistryMinutes / 60)
    
    // Cap credit hours so that ministry + credit <= 55
    const maxCreditHours = Math.max(0, 55 - ministryHours)
    const creditHours = Math.min(totalNonMinistryHours, maxCreditHours)
    
    formData.creditHours = creditHours
  }
})

// Helper functions
function formatTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

function handleSubmit(event: FormSubmitEvent<ReportFormData>) {
  emit('submit', event.data)
}
</script>