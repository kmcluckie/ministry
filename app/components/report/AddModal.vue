<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Add Report</h3>
        </template>

        <ReportForm
          :initial-data="initialData"
          submit-label="Add Report"
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

type Props = {
  open: boolean
  loading?: boolean
  initialData?: {
    month?: number
    year?: number
    studies?: number
    ministryHours?: number
    creditHours?: number
  }
}

type Emits = {
  'update:open': [value: boolean]
  submit: [data: ReportFormData]
  close: []
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  initialData: undefined
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

function handleSubmit(data: ReportFormData) {
  emit('submit', data)
}

function handleCancel() {
  emit('close')
}
</script>