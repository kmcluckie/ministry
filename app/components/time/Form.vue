<template>
  <UForm :state="formData" :schema="timeFormSchema" class="space-y-4" @submit="handleSubmit">
    <UFormField name="type" label="Type" required>
      <div class="flex flex-wrap gap-2">
        <!-- Existing type tags -->
        <UButton
          v-for="type in typeOptions"
          :key="type"
          :variant="formData.type === type ? 'solid' : 'subtle'"
          :color="formData.type === type ? 'primary' : 'neutral'"
          size="sm"
          @click="formData.type = type"
        >
          {{ type }}
        </UButton>
        
        <!-- New type input - shows when type is not in existing options -->
        <UInput
          v-if="!typeOptions.includes(formData.type)"
          v-model="formData.type"
          placeholder="Enter new type"
          size="sm"
          class="w-40"
        />
        
        <!-- New type button - shows when type matches an existing option -->
        <UButton
          v-else
          variant="ghost"
          color="neutral"
          size="sm"
          @click="formData.type = ''"
        >
          + New Type
        </UButton>
      </div>
    </UFormField>

    <UFormField name="recordedOn" label="Date" required>
      <UInput
        v-model="formData.recordedOn"
        type="date"
        placeholder="Select date"
        class="w-full"
      />
    </UFormField>

    <div class="grid grid-cols-2 gap-4">
      <UFormField name="hours" label="Hours" required>
        <UInput
          v-model.number="formData.hours"
          type="number"
          min="0"
          max="24"
          placeholder="0"
          class="w-full"
        />
      </UFormField>

      <UFormField name="minutes" label="Minutes" required>
        <UInput
          v-model.number="formData.minutes"
          type="number"
          min="0"
          max="59"
          placeholder="0"
          class="w-full"
        />
      </UFormField>
    </div>

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
import { timeFormSchema, type TimeFormData } from '../../../shared/validation/timeSchemas'
import type { FormSubmitEvent } from '@nuxt/ui'

type Props = {
  initialData?: {
    type?: string
    recordedOn?: string  
    hours?: number
    minutes?: number
  }
  submitLabel?: string
  loading?: boolean
  availableTypes?: string[]
}

type Emits = {
  submit: [data: TimeFormData]
  cancel: []
}

const props = withDefaults(defineProps<Props>(), {
  initialData: undefined,
  submitLabel: 'Save',
  loading: false,
  availableTypes: () => []
})

const emit = defineEmits<Emits>()

// Form data
const formData = reactive<TimeFormData>({
  type: (props.initialData?.type ?? 'Ministry') as string, // Default to Ministry
  recordedOn: (props.initialData?.recordedOn ?? new Date().toISOString().split('T')[0]) as string,
  hours: props.initialData?.hours ?? 0,
  minutes: props.initialData?.minutes ?? 0
})


const typeOptions = computed(() => {
  const defaultTypes = ['Ministry']
  const allTypes = [...new Set([...defaultTypes, ...props.availableTypes])]
  console.log('Available types from props:', props.availableTypes)
  console.log('Type options (simple array):', allTypes.sort())
  return allTypes.sort()
})

watch(() => props.initialData, (newData) => {
  if (newData) {
    formData.type = (newData.type ?? 'Ministry') as string
    formData.recordedOn = (newData.recordedOn ?? new Date().toISOString().split('T')[0]) as string
    formData.hours = newData.hours ?? 0
    formData.minutes = newData.minutes ?? 0
  }
}, { immediate: true, deep: true })


function handleSubmit(event: FormSubmitEvent<TimeFormData>) {
  emit('submit', event.data)
}
</script>