/**
 * WebSocket Hook（socket.io-client）
 * 连接 /ws/admin/notify
 * 监听 h5.submit.new 事件，收到后触发页面刷新
 */
import { onMounted, onUnmounted } from 'vue'
import { io, type Socket } from 'socket.io-client'
import { useNotifyStore } from '@/stores/notify'
import type { WsNotifyMessage } from '@/types'

let socket: Socket | null = null
const MAX_RECONNECT_DELAY = 30000

/**
 * 连接 WebSocket
 */
export function useWebSocket() {
  const notifyStore = useNotifyStore()

  function connect() {
    // socket.io v4：namespace 直接写在 URL 中
    // 生产/本地同源：PC 站点由 nginx 反代 /socket.io 到后端 API，无需写死地址
    const socketUrl = window.location.origin
    socket = io(`${socketUrl}/ws/admin/notify`, {
      reconnection: true,
      reconnectionDelay: 3000,
      reconnectionDelayMax: MAX_RECONNECT_DELAY,
      reconnectionAttempts: Infinity,
      transports: ['websocket', 'polling'],
    })

    // 连接成功
    socket.on('connect', () => {
      console.log('[WS] 连接成功，socket id:', socket?.id)
    })

    // 断开连接
    socket.on('disconnect', (reason) => {
      console.warn('[WS] 连接断开:', reason)
    })

    // 连接错误
    socket.on('connect_error', (err) => {
      console.error('[WS] 连接错误:', err.message)
    })

    // 监听 H5 新提交事件
    socket.on('h5.submit.new', (msg: WsNotifyMessage) => {
      console.log('[WS] 收到新提交通知:', msg)
      notifyStore.addNotify(msg)
    })
  }

  function disconnect() {
    if (socket) {
      socket.disconnect()
      socket = null
    }
  }

  onMounted(() => {
    connect()
  })

  onUnmounted(() => {
    disconnect()
  })

  return { disconnect, reconnect: connect }
}
