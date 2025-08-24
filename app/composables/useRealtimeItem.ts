import type { Database } from '../../types/database.types'

type TableName = keyof Database['public']['Tables']

interface RealtimeItemOptions<T extends { id: string }> {
  table: TableName
  id: string | Ref<string>
  apiEndpoint: string | ((id: string) => string)
  transform?: (item: T) => T
  onDeleted?: () => void
}

export function useRealtimeItem<T extends { id: string } = { id: string }>(
  options: RealtimeItemOptions<T>
) {
  type Item = T
  
  const itemId = typeof options.id === 'string' ? ref(options.id) : options.id
  
  // Get API endpoint
  const endpoint = computed(() => {
    if (typeof options.apiEndpoint === 'function') {
      return options.apiEndpoint(itemId.value)
    }
    return options.apiEndpoint
  })

  // Use Nuxt's useFetch for initial data loading
  const { data, pending, error, refresh } = useLazyFetch<Item>(endpoint, {
    key: `${options.table}-${itemId.value}`
  })

  // Reactive local copy for realtime updates
  const item = ref<Item | null>(null)
  
  // Sync initial data
  watch(data, (newData) => {
    if (newData) {
      const transformed = options.transform ? options.transform(newData as T) : (newData as T)
      item.value = transformed
    }
  }, { immediate: true })

  // Realtime subscription with filter for specific item
  const { state: realtimeState, reconnect } = useRealtimeSubscription({
    table: options.table,
    filter: `id=eq.${itemId.value}`,
    onUpdate: (payload) => {
      const updatedItem = payload.new as Item
      if (updatedItem.id === itemId.value) {
        const transformed = options.transform ? options.transform(updatedItem) : updatedItem
        item.value = transformed
      }
    },
    onDelete: (payload) => {
      const deletedItem = payload.old as Item
      if (deletedItem.id === itemId.value) {
        item.value = null
        options.onDeleted?.()
      }
    },
    onError: (error) => {
      console.error(`Realtime error for ${options.table} item ${itemId.value}:`, error)
    }
  })

  // Manual refresh
  const refreshItem = async () => {
    await refresh()
  }

  return {
    // Data
    item: readonly(item),
    pending: readonly(pending),
    error: readonly(error),
    
    // Actions
    refresh: refreshItem,
    
    // Realtime state
    realtimeState,
    reconnect
  }
}