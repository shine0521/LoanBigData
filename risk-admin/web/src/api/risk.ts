/**
 * Axios 封装
 * - 自动注入 JWT Token
 * - 统一响应解析 { code, message, data }
 * - 错误 toast 提示
 */
import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { useUserStore } from '@/stores/user'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

const instance: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// 请求拦截器：注入 Token
instance.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器：统一解析 + 错误处理
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data
    if (res.code === 0 || res.code === 200) {
      return res
    }
    // 业务错误
    ElMessage.error(res.message || '请求失败')
    return Promise.reject(res)
  },
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || error.message

    if (status === 401) {
      // Token 过期/无效，跳转登录
      ElMessage.error('登录已过期，请重新登录')
      const userStore = useUserStore()
      userStore.logout()
      router.push('/login')
    } else if (status === 403) {
      ElMessage.error('无权限操作')
    } else if (status === 500) {
      ElMessage.error('服务器错误')
    } else if (status === 0) {
      ElMessage.error('网络连接失败，请检查网络')
    } else {
      ElMessage.error(message || '请求失败')
    }
    return Promise.reject(error)
  }
)

export default instance
