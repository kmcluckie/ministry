<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Edit Report</h3>
        </template>

        <ReportForm
          :initial-data="mappedReportData"
          submit-label="Save Changes"
          :loading="loading"
          @submit="handleSubmit"
          @cancel="handleCancel"
        />
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { ReportFormData } from '../../../shared/validation/reportSchemas'
import type { Report } from '../../../types/ministry.types'

type Props = {
  open: boolean
  report?: Report | null
  loading?: boolean
}

type Emits = {
  'update:open': [value: boolean]
  submit: [data: ReportFormData]
  close: []
}

const props = withDefaults(defineProps<Props>(), {
  report: null,
  loading: false
})

const emit = defineEmits<Emits>()

const isOpen = computed({
  get: () => props.open,
  set: (value) => {
    if (!value) {
      emit('close')
    }
  }
})

const mappedReportData = computed(() => {
  if (!props.report) return undefined
  return {
    month: props.report.month,
    year: props.report.year,
    studies: props.report.studies,
    ministryHours: props.report.ministryHours,
    creditHours: props.report.creditHours
  }
})

function handleSubmit(data: ReportFormData) {
  emit('submit', data)
}

function handleCancel() {
  emit('close')
}
</script>