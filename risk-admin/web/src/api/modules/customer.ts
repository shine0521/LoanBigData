/**
 * 客户管理 API
 */
import api from '../risk'
import type { ApiResponse, Customer, CustomerForm, PageParams, PageResult } from '@/types'

export interface CustomerListParams extends PageParams {
  keyword?: string
  riskLevel?: number
}

export const customerApi = {
  // 获取客户列表
  getCustomers(params: CustomerListParams): Promise<ApiResponse<PageResult<Customer>>> {
    return api.get('/admin/customers', { params })
  },

  // 新增客户
  createCustomer(data: CustomerForm): Promise<ApiResponse<Customer>> {
    return api.post('/admin/customers', data)
  },

  // 更新客户
  updateCustomer(id: number, data: CustomerForm): Promise<ApiResponse<Customer>> {
    return api.put(`/admin/customers/${id}`, data)
  },

  // 删除客户（软删）
  deleteCustomer(id: number): Promise<ApiResponse<null>> {
    return api.delete(`/admin/customers/${id}`)
  },

  // 批量导入
  importCustomers(formData: FormData): Promise<ApiResponse<{ success: number; fail: number }>> {
    return api.post('/admin/customers/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
