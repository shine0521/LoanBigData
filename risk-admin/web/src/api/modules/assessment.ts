/**
 * 评分记录 API
 */
import api from '../risk'
import type { ApiResponse, Assessment, AssessmentDetail, PageParams, PageResult } from '@/types'
import type { AssessmentFilter } from '@/types'

export const assessmentApi = {
  // 获取评分记录列表
  getAssessments(params: AssessmentFilter): Promise<ApiResponse<PageResult<Assessment>>> {
    return api.get('/admin/assessments', { params })
  },

  // 获取评分详情
  getAssessmentDetail(id: number): Promise<ApiResponse<AssessmentDetail>> {
    return api.get(`/admin/assessments/${id}`)
  },

  // 手动重算评分
  recalcAssessment(id: number): Promise<ApiResponse<null>> {
    return api.post(`/admin/assessments/${id}/recalc`)
  },

  // 人工修正评分
  correctScore(id: number, data: { score: number; reason: string }): Promise<ApiResponse<null>> {
    return api.put(`/admin/scores/${id}`, data)
  },
}
