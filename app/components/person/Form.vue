<template>
  <UForm :state="formData" :schema="personFormSchema" class="space-y-4" @submit="handleSubmit">
    <UFormField name="name" label="Name" required>
      <UInput
        v-model="formData.name"
        placeholder="Enter person's name"
        class="w-full"
      />
    </UFormField>

    <UFormField name="address" label="Address">
      <UTextarea
        v-model="formData.address"
        placeholder="Enter address (optional)"
        :rows="2"
        class="w-full"
      />
    </UFormField>

    <UFormField name="notes" label="Notes">
      <UTextarea
        v-model="formData.notes"
        placeholder="Add any notes (optional)"
        :rows="3"
        maxlength="2000"
        class="w-full"
      />
    </UFormField>

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
import { personFormSchema, type PersonFormData } from '../../../shared/validation/personSchemas'
import type { FormSubmitEvent } from '@nuxt/ui'

type Props = {
  initialData?: Partial<PersonFormData>
  submitLabel?: string
  loading?: boolean
}

type Emits = {
  submit: [data: PersonFormData]
  cancel: []
}

const props = withDefaults(defineProps<Props>(), {
  submitLabel: 'Save',
  loading: false
})

const emit = defineEmits<Emits>()

const formData = reactive<PersonFormData>({
  name: props.initialData?.name || '',
  address: props.initialData?.address || null,
  notes: props.initialData?.notes || null
})

watch(() => props.initialData, (newData) => {
  if (newData) {
    formData.name = newData.name || ''
    formData.address = newData.address || null
    formData.notes = newData.notes || null
  }
}, { immediate: true, deep: true })

function handleSubmit(event: FormSubmitEvent<PersonFormData>) {
  emit('submit', event.data)
}
</script>