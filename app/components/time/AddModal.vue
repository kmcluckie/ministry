<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Add Time Record</h3>
        </template>

        <TimeForm
          submit-label="Add Time"
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

type Props = {
  open: boolean
  loading?: boolean
  availableTypes?: string[]
}

type Emits = {
  'update:open': [value: boolean]
  submit: [data: TimeFormData]
  close: []
}

const props = withDefaults(defineProps<Props>(), {
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

function handleSubmit(data: TimeFormData) {
  emit('submit', data)
}

function handleCancel() {
  emit('close')
}
</script>