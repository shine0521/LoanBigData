/**
 * 系统管理 API（管理员账号、操作日志）
 */
import api from '../risk'
import type { ApiResponse, AdminUser, OperationLog, PageParams, PageResult } from '@/types'

export interface AdminUserParams extends PageParams {
  keyword?: string
  role?: string
}

export const systemApi = {
  // ========== 管理员账号 ==========
  // 获取管理员列表
  getAdminUsers(params: AdminUserParams): Promise<ApiResponse<PageResult<AdminUser>>> {
    return api.get('/admin/admin-users', { params })
  },

  // 新增管理员
  createAdminUser(data: Partial<AdminUser>): Promise<ApiResponse<AdminUser>> {
    return api.post('/admin/admin-users', data)
  },

  // 更新管理员
  updateAdminUser(id: number, data: Partial<AdminUser>): Promise<ApiResponse<AdminUser>> {
    return api.put(`/admin/admin-users/${id}`, data)
  },

  // 删除管理员
  deleteAdminUser(id: number): Promise<ApiResponse<null>> {
    return api.delete(`/admin/admin-users/${id}`)
  },

  // ========== 操作日志 ==========
  // 获取操作日志列表
  getOperationLogs(params: PageParams & { keyword?: string; module?: string; startDate?: string; endDate?: string }): Promise<ApiResponse<PageResult<OperationLog>>> {
    return api.get('/admin/operation-logs', { params })
  },
}
