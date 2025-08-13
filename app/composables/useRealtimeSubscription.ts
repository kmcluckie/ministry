import type { Database } from '~/types/database.types'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

type TableName = keyof Database['public']['Tables']
type Row<T extends TableName> = Database['public']['Tables'][T]['Row']

interface RealtimeSubscriptionOptions<T extends TableName> {
  table: T
  schema?: string
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  filter?: string
  onInsert?: (payload: RealtimePostgresChangesPayload<Row<T>>) => void
  onUpdate?: (payload: RealtimePostgresChangesPayload<Row<T>>) => void
  onDelete?: (payload: RealtimePostgresChangesPayload<Row<T>>) => void
  onError?: (error: Error) => void
}

interface RealtimeSubscriptionState {
  isConnected: boolean
  isSubscribed: boolean
  error: string | null
  connectionStatus: 'CONNECTING' | 'OPEN' | 'CLOSED' | 'ERROR'
}

export function useRealtimeSubscription<T extends TableName>(
  options: RealtimeSubscriptionOptions<T>
) {
  const { client } = useSupabase()
  
  const state = reactive<RealtimeSubscriptionState>({
    isConnected: false,
    isSubscribed: false,
    error: null,
    connectionStatus: 'CLOSED'
  })

  let channel: RealtimeChannel | null = null

  const subscribe = () => {
    if (channel) {
      console.warn('Already subscribed to realtime channel')
      return
    }

    state.connectionStatus = 'CONNECTING'
    state.error = null

    // Create unique channel name
    const channelName = `${options.table}-${Date.now()}-${Math.random().toString(36).substring(7)}`
    
    channel = client.channel(channelName)

    // Set up postgres changes listener
    const config = {
      event: options.event || '*',
      schema: options.schema || 'public',
      table: options.table,
      ...(options.filter && { filter: options.filter })
    }

    channel.on(
      'postgres_changes',
      config,
      (payload: RealtimePostgresChangesPayload<Row<T>>) => {
        try {
          switch (payload.eventType) {
            case 'INSERT':
              options.onInsert?.(payload)
              break
            case 'UPDATE':
              options.onUpdate?.(payload)
              break
            case 'DELETE':
              options.onDelete?.(payload)
              break
          }
        } catch (error) {
          const err = error instanceof Error ? error : new Error('Unknown error in realtime handler')
          state.error = err.message
          options.onError?.(err)
        }
      }
    )

    // Subscribe to the channel
    channel.subscribe((status, error) => {
      state.connectionStatus = status as RealtimeSubscriptionState['connectionStatus']
      
      switch (status) {
        case 'SUBSCRIBED':
          state.isSubscribed = true
          state.isConnected = true
          state.error = null
          break
        case 'CHANNEL_ERROR':
        case 'TIMED_OUT':
          state.isSubscribed = false
          state.isConnected = false
          state.error = error?.message || 'Subscription error'
          options.onError?.(new Error(state.error))
          break
        case 'CLOSED':
          state.isSubscribed = false
          state.isConnected = false
          break
      }
    })
  }

  const unsubscribe = () => {
    if (channel) {
      client.removeChannel(channel)
      channel = null
      state.isSubscribed = false
      state.isConnected = false
      state.connectionStatus = 'CLOSED'
      state.error = null
    }
  }

  const reconnect = () => {
    unsubscribe()
    setTimeout(() => {
      subscribe()
    }, 1000) // Wait 1 second before reconnecting
  }

  // Auto-subscribe when component mounts
  onMounted(() => {
    subscribe()
  })

  // Auto-unsubscribe when component unmounts
  onUnmounted(() => {
    unsubscribe()
  })

  return {
    state: readonly(state),
    subscribe,
    unsubscribe,
    reconnect
  }
}