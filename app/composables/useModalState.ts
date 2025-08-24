export interface ModalConfig<T extends string = string> {
  allowedModals: readonly T[]
  paramKeys?: readonly string[]
}

export interface ModalDefinition<T extends string = string> {
  key: T
  params?: string[]
}

// Helper function to convert kebab-case to PascalCase
function toPascalCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

// Overloaded function signatures
export function useModalState<T extends string>(modals: ModalDefinition<T>[]): {
  modalType: Readonly<ComputedRef<T | null>>
  closeModal: (paramsToRemove?: string[]) => void
} & Record<string, any>

export function useModalState<T extends string>(config: ModalConfig<T>): {
  modalType: Readonly<ComputedRef<T | null>>
  getParam: (key: string) => ComputedRef<string | undefined>
  isModalOpen: (type: T) => ComputedRef<boolean>
  openModal: (type: T, params?: Record<string, string>) => void
  closeModal: (paramsToRemove?: string[]) => void
}

// Implementation
export function useModalState<T extends string>(
  configOrModals: ModalConfig<T> | ModalDefinition<T>[]
) {
  const route = useRoute()
  const router = useRouter()

  // Determine if using simple or advanced interface
  const isSimpleInterface = Array.isArray(configOrModals)
  
  // Extract config from either interface
  const config: ModalConfig<T> = isSimpleInterface
    ? {
        allowedModals: configOrModals.map(m => m.key) as readonly T[],
        paramKeys: configOrModals.flatMap(m => m.params || []) as readonly string[]
      }
    : configOrModals

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

  // Return appropriate interface based on input
  if (isSimpleInterface) {
    const modals = configOrModals as ModalDefinition<T>[]
    
    // Create modal state object with computed properties
    const modalStates = Object.fromEntries(
      modals.map(modal => [
        `show${toPascalCase(modal.key)}Modal`,
        computed(() => modalType.value === modal.key)
      ])
    )

    // Create parameter getters
    const params = Object.fromEntries(
      (config.paramKeys || []).map(key => [key, getParam(key)])
    )

    // Create open functions
    const openFunctions = Object.fromEntries(
      modals.map(modal => [
        `open${toPascalCase(modal.key)}Modal`,
        modal.params && modal.params.length > 0
          ? (paramValues: Record<string, string>) => openModal(modal.key, paramValues)
          : () => openModal(modal.key)
      ])
    )

    return {
      modalType: readonly(modalType),
      closeModal,
      ...modalStates,
      ...params,
      ...openFunctions
    }
  } else {
    // Return advanced interface
    return {
      modalType: readonly(modalType),
      getParam,
      isModalOpen,
      openModal,
      closeModal
    }
  }
}