import type { Database } from '../../types/database.types'
import { debounce } from 'lodash-es'

type TableName = keyof Database['public']['Tables']
type Row<T extends TableName> = Database['public']['Tables'][T]['Row']

interface RealtimeListOptions<T extends TableName> {
  table: T
  apiEndpoint: string
  searchField?: keyof Row<T> | string
  sortBy?: keyof Row<T> | string
  sortOrder?: 'asc' | 'desc'
  initialSearch?: string
  filter?: string
  transform?: (item: Row<T>) => Row<T>
}

interface RealtimeListState<T> {
  items: T[]
  pending: boolean
  error: string | null
}

export function useRealtimeList<T extends TableName>(
  options: RealtimeListOptions<T>
) {
  type Item = Row<T>
  
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
      const aVal = a[sortField]
      const bVal = b[sortField]
      
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

  // Check if item matches current search
  const matchesSearch = (item: Item): boolean => {
    if (!searchQuery.value || !options.searchField) return true
    
    const searchField = options.searchField as keyof Item
    const fieldValue = item[searchField]
    
    if (typeof fieldValue === 'string') {
      return fieldValue.toLowerCase().includes(searchQuery.value.toLowerCase())
    }
    
    return String(fieldValue).toLowerCase().includes(searchQuery.value.toLowerCase())
  }

  // Realtime subscription
  const { state: realtimeState, reconnect } = useRealtimeSubscription({
    table: options.table,
    filter: options.filter,
    onInsert: (payload) => {
      const newItem = payload.new as Item
      const transformedItem = options.transform ? options.transform(newItem) : newItem
      
      // Only add if not already in list and matches search
      if (!items.value.find(item => item.id === newItem.id)) {
        if (matchesSearch(transformedItem)) {
          items.value.push(transformedItem)
          sortItems()
        }
      }
    },
    onUpdate: (payload) => {
      const updatedItem = payload.new as Item
      const transformedItem = options.transform ? options.transform(updatedItem) : updatedItem
      const index = items.value.findIndex(item => item.id === updatedItem.id)
      
      if (index !== -1) {
        if (matchesSearch(transformedItem)) {
          items.value[index] = transformedItem
          sortItems()
        } else {
          // Remove if no longer matches search
          items.value.splice(index, 1)
        }
      } else if (matchesSearch(transformedItem)) {
        // Add if now matches search and wasn't there before
        items.value.push(transformedItem)
        sortItems()
      }
    },
    onDelete: (payload) => {
      const deletedItem = payload.old as Item
      const index = items.value.findIndex(item => item.id === deletedItem.id)
      if (index !== -1) {
        items.value.splice(index, 1)
      }
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