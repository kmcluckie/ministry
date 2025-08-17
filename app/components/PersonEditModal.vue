<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Edit Person</h3>
        </template>

        <PersonForm
          :initial-data="mappedPersonData"
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
import type { PersonFormData } from '../../shared/validation/personSchemas'

type Person = {
  id: string
  name: string
  address: string | null
  notes: string | null
}

type Props = {
  open: boolean
  person?: Person | null
  loading?: boolean
}

type Emits = {
  'update:open': [value: boolean]
  submit: [data: PersonFormData]
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const mappedPersonData = computed(() => {
  if (!props.person) return undefined
  return {
    name: props.person.name,
    address: props.person.address,
    notes: props.person.notes
  }
})

function handleSubmit(data: PersonFormData) {
  emit('submit', data)
}

function handleCancel() {
  isOpen.value = false
}
</script>