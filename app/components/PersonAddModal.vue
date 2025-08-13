<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Add New Person</h3>
        </template>

        <PersonForm
          submit-label="Add Person"
          :loading="loading"
          @submit="handleSubmit"
          @cancel="handleCancel"
        />
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
type PersonFormData = {
  name: string
  address: string
  notes: string
}

type Props = {
  open: boolean
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

function handleSubmit(data: PersonFormData) {
  emit('submit', data)
}

function handleCancel() {
  isOpen.value = false
}
</script>