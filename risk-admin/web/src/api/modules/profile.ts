/**
 * 用户资料记录 API（H5 提交记录）
 */
import api from '../risk'
import type { ApiResponse, CustomerProfile, PageParams, PageResult } from '@/types'
import type { ProfileFilter } from '@/types'

export const profileApi = {
  // 获取资料记录列表
  getProfiles(params: ProfileFilter): Promise<ApiResponse<PageResult<CustomerProfile>>> {
    return api.get('/admin/profiles', { params })
  },
}
