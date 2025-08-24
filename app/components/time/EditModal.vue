<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Edit Time Record</h3>
        </template>

        <TimeForm
          :initial-data="mappedTimeData"
          submit-label="Save Changes"
          :loading="loading"
          :available-types="availableTypes"
          @submit="handleSubmit"
          @cancel="handleCancel"
        />
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { TimeFormData } from '../../../shared/validation/timeSchemas'

type TimeRecord = {
  id: string
  type: string
  recordedOn: string
  hours: number
  minutes: number
}

type Props = {
  open: boolean
  timeRecord?: TimeRecord | null
  loading?: boolean
  availableTypes?: string[]
}

type Emits = {
  'update:open': [value: boolean]
  submit: [data: TimeFormData]
  close: []
}

const props = withDefaults(defineProps<Props>(), {
  timeRecord: null,
  loading: false,
  availableTypes: () => []
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

const mappedTimeData = computed(() => {
  if (!props.timeRecord) return undefined
  return {
    type: props.timeRecord.type,
    recordedOn: props.timeRecord.recordedOn,
    hours: props.timeRecord.hours,
    minutes: props.timeRecord.minutes
  }
})

function handleSubmit(data: TimeFormData) {
  emit('submit', data)
}

function handleCancel() {
  emit('close')
}
</script>