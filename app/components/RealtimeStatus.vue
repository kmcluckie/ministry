<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="transform opacity-0 translate-y-2"
    enter-to-class="transform opacity-100 translate-y-0"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="transform opacity-100 translate-y-0"
    leave-to-class="transform opacity-0 translate-y-2"
  >
    <div 
      v-if="shouldShow"
      :class="statusClasses"
      class="fixed bottom-4 right-4 px-3 py-2 rounded-lg shadow-lg border flex items-center gap-2 text-sm font-medium z-50"
    >
      <UIcon :name="statusIcon" :class="iconClasses" />
      {{ statusText }}
      
      <UButton
        v-if="state.error && state.connectionStatus !== 'CONNECTING'"
        icon="i-heroicons-arrow-path"
        color="neutral"
        variant="ghost"
        size="xs"
        :loading="false"
        @click="reconnect"
      />
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface RealtimeState {
  isConnected: boolean
  isSubscribed: boolean
  error: string | null
  connectionStatus: 'CONNECTING' | 'OPEN' | 'CLOSED' | 'ERROR'
}

interface Props {
  state: RealtimeState
  reconnect: () => void
  alwaysShow?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  alwaysShow: false
})

// Show status when there's an issue, when connecting, or when alwaysShow is true
const shouldShow = computed(() => {
  return props.alwaysShow || 
         props.state.error !== null || 
         props.state.connectionStatus === 'CONNECTING' ||
         !props.state.isConnected
})

const statusText = computed(() => {
  if (props.state.error) {
    return 'Connection error'
  }
  
  switch (props.state.connectionStatus) {
    case 'CONNECTING':
      return 'Connecting...'
    case 'OPEN':
      return props.state.isSubscribed ? 'Connected' : 'Subscribing...'
    case 'CLOSED':
      return 'Disconnected'
    case 'ERROR':
      return 'Connection failed'
    default:
      return 'Unknown status'
  }
})

const statusIcon = computed(() => {
  if (props.state.error || props.state.connectionStatus === 'ERROR') {
    return 'i-heroicons-exclamation-triangle'
  }
  
  switch (props.state.connectionStatus) {
    case 'CONNECTING':
      return 'i-heroicons-arrow-path'
    case 'OPEN':
      return props.state.isSubscribed ? 'i-heroicons-wifi' : 'i-heroicons-arrow-path'
    case 'CLOSED':
      return 'i-heroicons-wifi-slash'
    default:
      return 'i-heroicons-question-mark-circle'
  }
})

const iconClasses = computed(() => {
  const baseClasses = 'h-4 w-4'
  
  if (props.state.connectionStatus === 'CONNECTING' || 
      (!props.state.isSubscribed && props.state.connectionStatus === 'OPEN')) {
    return `${baseClasses} animate-spin`
  }
  
  return baseClasses
})

const statusClasses = computed(() => {
  if (props.state.error || props.state.connectionStatus === 'ERROR') {
    return 'bg-red-50 border-red-200 text-red-800'
  }
  
  switch (props.state.connectionStatus) {
    case 'CONNECTING':
      return 'bg-yellow-50 border-yellow-200 text-yellow-800'
    case 'OPEN':
      return props.state.isSubscribed 
        ? 'bg-green-50 border-green-200 text-green-800'
        : 'bg-yellow-50 border-yellow-200 text-yellow-800'
    case 'CLOSED':
      return 'bg-gray-50 border-gray-200 text-gray-800'
    default:
      return 'bg-gray-50 border-gray-200 text-gray-800'
  }
})
</script>