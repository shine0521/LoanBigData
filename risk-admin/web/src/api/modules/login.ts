/**
 * 登录相关 API
 */
import api from '../risk'
import type { ApiResponse, LoginForm, LoginResult } from '@/types'

export const loginApi = {
  // 管理员登录
  login(data: LoginForm): Promise<ApiResponse<LoginResult>> {
    return api.post('/admin/login', data)
  },
}
