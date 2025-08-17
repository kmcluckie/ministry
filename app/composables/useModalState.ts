export interface ModalConfig<T extends string = string> {
  allowedModals: readonly T[]
  paramKeys?: readonly string[]
}

export function useModalState<T extends string>(config: ModalConfig<T>) {
  const route = useRoute()
  const router = useRouter()

  // Current modal state from URL
  const modalType = computed<T | null>(() => {
    const modal = route.query.modal as string
    if (!modal || !config.allowedModals.includes(modal as T)) {
      return null
    }
    return modal as T
  })

  // Dynamic parameter getters
  const getParam = (key: string) => computed(() => route.query[key] as string | undefined)

  // Generic modal visibility checker
  const isModalOpen = (type: T) => computed(() => modalType.value === type)

  // Navigation functions
  const openModal = (type: T, params?: Record<string, string>) => {
    const query = { ...route.query, modal: type, ...params }
    router.push({ query })
  }

  const closeModal = (paramsToRemove?: string[]) => {
    const query = { ...route.query }
    
    // Remove modal and specified params
    const keysToRemove = ['modal', ...(paramsToRemove || config.paramKeys || [])]
    
    // Create new query object without the keys to remove
    const cleanQuery = Object.fromEntries(
      Object.entries(query).filter(([key]) => !keysToRemove.includes(key))
    )
    
    router.push({ query: cleanQuery })
  }

  return {
    modalType: readonly(modalType),
    getParam,
    isModalOpen,
    openModal,
    closeModal
  }
}