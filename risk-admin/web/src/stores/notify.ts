import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { WsNotifyMessage } from '@/types'

export const useNotifyStore = defineStore('notify', () => {
  // 未读消息列表
  const unreadList = ref<WsNotifyMessage[]>([])
  // 未读数量（角标显示）
  const unreadCount = ref<number>(0)
  // 新记录提示文本
  const newRecordTip = ref<string>('')
  // 是否显示提示
  const showTip = ref<boolean>(false)

  // 刷新回调列表（各页面注册刷新函数）
  const refreshCallbacks: Record<string, () => void> = {}

  function addNotify(msg: WsNotifyMessage) {
    unreadList.value.unshift(msg)
    unreadCount.value++
    // 显示顶部提示
    newRecordTip.value = `📩 收到新提交：${msg.data.name}（${msg.data.phone}）`
    showTip.value = true

    // 触发注册页面的刷新回调
    Object.values(refreshCallbacks).forEach(cb => cb())

    // 3秒后自动隐藏提示
    setTimeout(() => {
      showTip.value = false
    }, 5000)
  }

  function markRead() {
    unreadCount.value = 0
    showTip.value = false
  }

  function registerRefresh(key: string, cb: () => void) {
    refreshCallbacks[key] = cb
  }

  function unregisterRefresh(key: string) {
    delete refreshCallbacks[key]
  }

  const hasUnread = computed(() => unreadCount.value > 0)

  return {
    unreadList,
    unreadCount,
    newRecordTip,
    showTip,
    hasUnread,
    addNotify,
    markRead,
    registerRefresh,
    unregisterRefresh,
  }
})
