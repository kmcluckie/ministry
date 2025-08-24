<template>
  <div class="p-4">
    <div class="mb-4 flex flex-row gap-3 items-center justify-between">
      <div/>
      <UButton 
        icon="i-heroicons-plus" 
        @click="openAddReportModal"
      >
        Add Report
      </UButton>
    </div>

    <div v-if="pending" class="flex justify-center py-8">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin h-6 w-6 text-[var(--ui-text-muted)]" />
    </div>

    <div v-else-if="error" class="bg-[var(--ui-color-error-50)] border border-[var(--ui-color-error-200)] rounded-lg p-4">
      <p class="text-error">Error loading reports: {{ error.message }}</p>
    </div>

    <div v-else-if="!reports || reports.length === 0" class="rounded-lg border border-[var(--ui-border)] p-8 text-center">
      <UIcon name="i-heroicons-document-text" class="h-12 w-12 text-[var(--ui-text-muted)] mx-auto mb-3" />
      <p class="text-[var(--ui-text-muted)]">No reports added yet</p>
      <p class="text-sm text-[var(--ui-text-muted)] mt-2">Click "Add Report" to get started</p>
    </div>

    <div v-else class="space-y-4">
      <!-- Current Service Year Summary -->
      <ReportServiceYearSummary
        v-if="currentServiceYearReports.length > 0"
        :service-year="currentServiceYear"
        :reports="currentServiceYearReports"
      />

      <!-- Reports grouped by service year -->
      <div v-for="group in groupedReports" :key="group.serviceYear" class="space-y-4">
        <!-- Service Year Summary (for non-current years) -->
        <ReportServiceYearSummary
          v-if="group.serviceYear !== currentServiceYear"
          :service-year="group.serviceYear"
          :reports="group.reports"
        />

        <!-- Reports for this service year -->
        <div class="space-y-4">
          <div
            v-for="report in group.reports"
            :key="report.id"
            class="rounded-lg border border-[var(--ui-border)] p-4 hover:shadow-md transition-shadow"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3">
                  <div class="font-semibold text-[var(--ui-text)]">
                    {{ formatMonth(report.month) }} {{ report.year }}
                  </div>
                  <div class="text-[var(--ui-text-muted)]">
                    {{ report.totalHours }} hours
                  </div>
                </div>
                
                <div class="mt-2 grid grid-cols-3 gap-4 text-sm">
                  <div class="col-span-1">
                    <span class="text-[var(--ui-text-muted)]">Studies:</span>
                    <span class="ml-1 text-[var(--ui-text)]">{{ report.studies }}</span>
                  </div>
                  <div class="col-span-2">
                    <span class="text-[var(--ui-text-muted)]">Hours:</span>
                    <span class="ml-1 text-[var(--ui-text)]">
                      {{ report.ministryHours }}h
                      <span v-if="report.creditHours"> + {{ report.creditHours }}h credits</span>
                    </span>
                  </div>
                </div>

                <!-- Time Record Summary -->
                <ReportMonthSummary
                  v-if="getTimeRecordsForMonth(report.month, report.year).length > 0"
                  :month="report.month"
                  :year="report.year"
                  :time-records="getTimeRecordsForMonth(report.month, report.year)"
                  class="mt-3"
                />
              </div>
              
              <UDropdownMenu :items="getReportActions(report)">
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
      </div>
    </div>

    <ReportAddModal
      :open="showAddReportModal"
      :loading="isAdding"
      :initial-data="defaultFormData"
      @submit="handleAddReport"
      @close="closeModal"
    />

    <ReportEditModal
      :open="showEditReportModal"
      :report="currentEditingReport"
      :loading="isEditing"
      @submit="handleEditReport"
      @close="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import type { ReportFormData } from '../../../shared/validation/reportSchemas'
import type { Report } from '../../../types/ministry.types'


// Modal state management
const {
  showAddReportModal, showEditReportModal, reportId, closeModal,
  openAddReportModal, openEditReportModal
} = useModalState([
  { key: 'add-report' },
  { key: 'edit-report', params: ['reportId'] }
])

// Loading states
const isAdding = ref(false)
const isEditing = ref(false)

// Data
const reports = ref<Report[]>([])
const defaultFormData = ref<any>(null)
const pending = ref(false)
const error = ref<Error | null>(null)

// Current editing report computed from URL reportId
const currentEditingReport = computed(() => {
  if (!reportId.value || !reports.value) return null
  return reports.value.find(report => report.id === reportId.value) || null
})

// Service year calculations
const currentServiceYear = computed(() => {
  const now = new Date()
  return now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1
})

const currentServiceYearReports = computed(() => {
  return reports.value.filter(report => getServiceYear(report.month, report.year) === currentServiceYear.value)
})

// Group reports by service year (reverse chronological)
const groupedReports = computed(() => {
  const groups: Record<number, Report[]> = {}
  
  reports.value.forEach((report: Report) => {
    const serviceYear = getServiceYear(report.month, report.year)
    if (!groups[serviceYear]) {
      groups[serviceYear] = []
    }
    groups[serviceYear].push(report)
  })
  
  // Sort each group by month/year (latest first)
  Object.values(groups).forEach((group: Report[]) => {
    group.sort((a: Report, b: Report) => {
      if (a.year !== b.year) return b.year - a.year
      return b.month - a.month
    })
  })
  
  // Convert to array and sort by service year (latest first)
  return Object.entries(groups)
    .map(([serviceYear, reportsInYear]) => ({
      serviceYear: Number(serviceYear),
      reports: reportsInYear
    }))
    .sort((a, b) => b.serviceYear - a.serviceYear)
})


// Helper functions
function getServiceYear(month: number, year: number): number {
  return month >= 9 ? year : year - 1
}

function formatMonth(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return months[month - 1] || ''
}

function getNextMonthWithoutReport(): { month: number; year: number } | null {
  const now = new Date()
  let checkMonth = now.getMonth() + 1 // 0-based, so add 1 (current month)
  let checkYear = now.getFullYear()
  
  // Look ahead up to 12 months, starting with current month
  for (let i = 0; i < 12; i++) {
    const hasReport = reports.value.some((report: Report) => 
      report.month === checkMonth && report.year === checkYear
    )
    
    if (!hasReport) {
      return { month: checkMonth, year: checkYear }
    }
    
    // Move to next month after checking
    checkMonth += 1
    if (checkMonth > 12) {
      checkMonth = 1
      checkYear += 1
    }
  }
  
  return null
}

function getTimeRecordsForMonth(month: number, year: number) {
  // This function is called from the template but the time records
  // are now fetched directly in the form component
  // Return empty array as this is just for the display logic
  return []
}


// Actions
const getReportActions = (report: Report) => [
  [{
    label: 'Edit',
    icon: 'i-heroicons-pencil',
    onSelect: () => openEditReportModal({ reportId: report.id })
  }],
  [{
    label: 'Delete',
    icon: 'i-heroicons-trash',
    onSelect: () => handleDeleteReport(report.id)
  }]
]

// Load data
async function loadReports() {
  pending.value = true
  error.value = null
  
  try {
    reports.value = await $fetch('/api/reports')
  } catch (err) {
    error.value = err as Error
  } finally {
    pending.value = false
  }
}


// CRUD operations
async function handleAddReport(data: ReportFormData) {
  isAdding.value = true
  
  try {
    await $fetch('/api/reports', {
      method: 'POST',
      body: data
    })
    
    closeModal()
    await loadReports()
    
    const toast = useToast()
    toast.add({
      title: 'Success',
      description: 'Report added successfully'
    })
  } catch {
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: 'Failed to add report',
      color: 'error'
    })
  } finally {
    isAdding.value = false
  }
}

// Load default values for new reports
async function loadReportDefaults() {
  try {
    const defaults = await $fetch('/api/reports/defaults')
    return defaults
  } catch {
    // Fallback to next month without report
    const nextMonth = getNextMonthWithoutReport()
    return nextMonth || { month: new Date().getMonth() + 1, year: new Date().getFullYear() }
  }
}

async function handleEditReport(data: ReportFormData) {
  if (!currentEditingReport.value) return
  
  isEditing.value = true
  const reportId = currentEditingReport.value.id
  
  try {
    await $fetch(`/api/reports/${reportId}`, {
      method: 'PUT',
      body: data
    } as any)
    
    closeModal()
    await loadReports()
    
    const toast = useToast()
    toast.add({
      title: 'Success',
      description: 'Report updated successfully'
    })
  } catch {
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: 'Failed to update report',
      color: 'error'
    })
  } finally {
    isEditing.value = false
  }
}

async function handleDeleteReport(id: string) {
  const confirmed = confirm('Are you sure you want to delete this report?')
  
  if (!confirmed) return
  
  try {
    await $fetch(`/api/reports/${id}`, {
      method: 'DELETE'
    } as any)
    
    await loadReports()
    
    const toast = useToast()
    toast.add({
      title: 'Success',
      description: 'Report deleted successfully'
    })
  } catch {
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: 'Failed to delete report',
      color: 'error'
    })
  }
}

// Initialize data on mount
onMounted(async () => {
  await loadReports()
  defaultFormData.value = await loadReportDefaults()
})
</script>