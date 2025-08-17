<template>
  <UForm :state="formData" :schema="visitFormSchema" class="space-y-4" @submit="handleSubmit">
    <UFormField name="visitedAt" label="Date & Time" required>
      <UInput
        v-model="formData.visitedAt"
        type="datetime-local"
        required
        class="w-full"
      />
    </UFormField>

    <UFormField name="notes" label="Notes">
      <UTextarea
        v-model="formData.notes"
        placeholder="Add any notes about the visit (optional)"
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
import { visitFormSchema, type VisitFormData } from '../../../shared/validation/personSchemas'
import type { FormSubmitEvent } from '@nuxt/ui'

type Props = {
  initialData?: Partial<VisitFormData>
  submitLabel?: string
  loading?: boolean
}

type Emits = {
  submit: [data: VisitFormData]
  cancel: []
}

const props = withDefaults(defineProps<Props>(), {
  initialData: () => ({}),
  submitLabel: 'Save',
  loading: false
})

const emit = defineEmits<Emits>()

const formData = reactive<VisitFormData>({
  visitedAt: props.initialData?.visitedAt || new Date().toISOString().slice(0, 16),
  notes: props.initialData?.notes || ''
})

watch(() => props.initialData, (newData) => {
  if (newData) {
    formData.visitedAt = newData.visitedAt || new Date().toISOString().slice(0, 16)
    formData.notes = newData.notes || ''
  }
}, { immediate: true, deep: true })

function handleSubmit(event: FormSubmitEvent<VisitFormData>) {
  emit('submit', event.data)
}
</script>