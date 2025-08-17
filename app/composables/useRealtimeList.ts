import type { Database } from '../../types/database.types'
import { debounce } from 'lodash-es'

type TableName = keyof Database['public']['Tables']

interface RealtimeListOptions<T> {
  table: TableName
  apiEndpoint: string
  searchField?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  initialSearch?: string
  filter?: string
  transform?: (item: T) => T
}

interface RealtimeListState<T> {
  items: T[]
  pending: boolean
  error: string | null
}

export function useRealtimeList<T = any>(
  options: RealtimeListOptions<T>
) {
  type Item = T
  
  const searchQuery = ref(options.initialSearch || '')
  
  // Use Nuxt's useFetch for initial data loading
  const { data, pending, error, refresh } = useLazyFetch<Item[]>(options.apiEndpoint, {
    query: {
      ...(searchQuery.value && options.searchField ? { search: searchQuery.value } : {})
    },
    default: () => []
  })

  // Reactive local copy for realtime updates
  const items = ref<Item[]>([])
  
  // Sort function
  const sortItems = () => {
    if (!options.sortBy) return
    
    const sortField = options.sortBy as keyof Item
    const order = options.sortOrder || 'asc'
    
    items.value.sort((a, b) => {
      const aVal = (a as any)[sortField]
      const bVal = (b as any)[sortField]
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const result = aVal.localeCompare(bVal)
        return order === 'desc' ? -result : result
      }
      
      if (aVal < bVal) return order === 'desc' ? 1 : -1
      if (aVal > bVal) return order === 'desc' ? -1 : 1
      return 0
    })
  }
  
  // Sync initial data
  watch(data, (newData) => {
    if (newData) {
      items.value = [...newData]
      sortItems()
    }
  }, { immediate: true })



  // Realtime subscription
  const { state: realtimeState, reconnect } = useRealtimeSubscription({
    table: options.table,
    filter: options.filter,
    onInsert: () => {
      refresh()
    },
    onUpdate: () => {
      refresh()
    },
    onDelete: () => {
      refresh()
    },
    onError: (error) => {
      console.error(`Realtime error for ${options.table}:`, error)
    }
  })

  // Search functionality
  const debouncedRefresh = debounce(() => {
    refresh()
  }, 300)

  const setSearch = (query: string) => {
    searchQuery.value = query
    debouncedRefresh()
  }

  // Manual refresh
  const refreshList = async () => {
    await refresh()
  }

  return {
    // Data
    items: readonly(items),
    pending: readonly(pending),
    error: readonly(error),
    
    // Search
    searchQuery: readonly(searchQuery),
    setSearch,
    
    // Actions
    refresh: refreshList,
    
    // Realtime state
    realtimeState,
    reconnect
  }
}