<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Edit Visit</h3>
        </template>

        <VisitForm
          :initial-data="mappedVisitData"
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
import type { VisitFormData } from '../../../shared/validation/personSchemas'

type Visit = {
  id: string
  visitedAt: string
  notes: string | null
}

type Props = {
  open: boolean
  visit?: Visit | null
  loading?: boolean
}

type Emits = {
  'update:open': [value: boolean]
  submit: [data: VisitFormData & { id: string }]
  close: []
}

const props = withDefaults(defineProps<Props>(), {
  visit: null,
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

const mappedVisitData = computed(() => {
  if (!props.visit) return undefined
  
  // Convert datetime to input format
  const toInputDateTime = (dateString: string) => {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return ''
    }
    return date.toISOString().slice(0, 16)
  }
  
  return {
    visitedAt: toInputDateTime(props.visit.visitedAt),
    notes: props.visit.notes
  }
})

function handleSubmit(data: VisitFormData) {
  if (!props.visit) return
  emit('submit', { ...data, id: props.visit.id })
}

function handleCancel() {
  emit('close')
}
</script>