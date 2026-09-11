// ============================================
// 风险评分 Pinia Store
// 跨页面传递表单数据和评分结果
// ============================================
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SubmitParams, QueryScoreResponse, ComprehensiveScore, BankScore } from '@/api/risk'

export const useRiskStore = defineStore('risk', () => {
  // ---------- 提交表单数据 ----------
  const formData = ref<SubmitParams>({
    name: '',
    idCard: '',
    phone: '',
  })

  // 隐私协议是否勾选
  const privacyAgreed = ref(false)

  // 提交按钮 loading 状态
  const submitting = ref(false)

  // ---------- 评分结果数据 ----------
  const resultData = ref<QueryScoreResponse | null>(null)

  // 评估编号（用于直接拉取结果）
  const assessmentNo = ref<string>('')

  // ---------- Actions ----------

  /**
   * 保存提交表单
   */
  function saveFormData(data: SubmitParams) {
    formData.value = { ...data }
  }

  /**
   * 设置隐私协议勾选状态
   */
  function setPrivacyAgreed(agreed: boolean) {
    privacyAgreed.value = agreed
  }

  /**
   * 设置提交 loading
   */
  function setSubmitting(loading: boolean) {
    submitting.value = loading
  }

  /**
   * 保存评分结果
   */
  function saveResult(data: QueryScoreResponse) {
    resultData.value = data
    if (data.assessmentNo) {
      assessmentNo.value = data.assessmentNo
    }
  }

  /**
   * 保存评估编号
   */
  function saveAssessmentNo(no: string) {
    assessmentNo.value = no
  }

  /**
   * 清空所有状态（重新查询时）
   */
  function reset() {
    formData.value = { name: '', idCard: '', phone: '' }
    privacyAgreed.value = false
    submitting.value = false
    resultData.value = null
    assessmentNo.value = ''
  }

  // ---------- 计算属性（模拟 Pinia getter）----------
  /**
   * 综合评分对象
   */
  function getComprehensive(): ComprehensiveScore | null {
    return resultData.value?.comprehensive ?? null
  }

  /**
   * 银行评分列表
   */
  function getBanks(): BankScore[] {
    return resultData.value?.banks ?? []
  }

  return {
    // state
    formData,
    privacyAgreed,
    submitting,
    resultData,
    assessmentNo,
    // actions
    saveFormData,
    setPrivacyAgreed,
    setSubmitting,
    saveResult,
    saveAssessmentNo,
    reset,
    // getters
    getComprehensive,
    getBanks,
  }
})
