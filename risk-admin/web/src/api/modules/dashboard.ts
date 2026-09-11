/**
 * 工作台 API
 */
import api from '../risk'
import type { ApiResponse, DashboardData } from '@/types'

export const dashboardApi = {
  // 获取工作台统计数据
  getDashboard(): Promise<ApiResponse<DashboardData>> {
    return api.get('/admin/dashboard')
  },
}
