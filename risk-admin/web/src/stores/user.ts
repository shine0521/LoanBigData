import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AdminUser } from '@/types'

export const useUserStore = defineStore('user', () => {
  // 登录 Token
  const token = ref<string>(localStorage.getItem('admin_token') || '')
  // 当前登录用户信息
  const userInfo = ref<AdminUser | null>(null)

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('admin_token', newToken)
  }

  function setUserInfo(info: AdminUser) {
    userInfo.value = info
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('admin_token')
  }

  function isLoggedIn(): boolean {
    return !!token.value
  }

  return {
    token,
    userInfo,
    setToken,
    setUserInfo,
    logout,
    isLoggedIn,
  }
})
