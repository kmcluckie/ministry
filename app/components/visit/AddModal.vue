<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Add Visit</h3>
        </template>

        <VisitForm
          submit-label="Add Visit"
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

type Props = {
  open: boolean
  loading?: boolean
}

type Emits = {
  'update:open': [value: boolean]
  submit: [data: VisitFormData]
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

function handleSubmit(data: VisitFormData) {
  emit('submit', data)
}

function handleCancel() {
  isOpen.value = false
}
</script>