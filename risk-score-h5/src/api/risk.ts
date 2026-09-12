// ============================================
// 风险评分接口封装
// 与后端约定的 API 路径
// ============================================
import axios, { AxiosInstance, AxiosError } from 'axios'

// -------------------- 类型定义 --------------------

/** 提交查询请求参数 */
export interface SubmitParams {
  name: string
  idCard: string
  phone: string
}

/** 提交响应（返回评估单号 + 脱敏信息 + 综合分概览） */
export interface SubmitResponse {
  assessmentNo: string
  name: string
  phone: string
  comprehensive: {
    score: number
    level: string
  }
}

/** 单个银行评分（前端统一格式） */
export interface BankScore {
  scoreType: 'boc' | 'icbc' | 'abc' | 'ccb'
  bankName?: string       // 银行显示名（前端 mock 时填）
  score: number
  level: number           // 1 低 / 2 中 / 3 高
  levelName: string       // '低风险' | '中风险' | '高风险'
  trend: 'up' | 'down' | 'stable'
  details?: string[]
}

/** 综合评分 */
export interface ComprehensiveScore {
  score: number
  level: number           // 1 低 / 2 中 / 3 高
  levelName: string       // '低风险' | '中风险' | '高风险'
  description?: string    // 评分描述（可选）
}

/** 查询评分响应 */
export interface QueryScoreResponse {
  comprehensive: ComprehensiveScore
  banks: BankScore[]
  assessmentNo?: string
}

/** 通用 API 响应包装 */
export interface ApiResult<T> {
  code: number
  message: string
  data?: T
}

// -------------------- Axios 实例 --------------------

const instance: AxiosInstance = axios.create({
  // baseURL 已由 vite proxy 代理，接口路径写相对路径即可
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

instance.interceptors.request.use((config) => {
  if (config.params) {
    config.params._t = Date.now()
  } else {
    config.params = { _t: Date.now() }
  }
  return config
})

instance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResult<unknown>>) => {
    const msg =
      error.response?.data?.message ||
      error.message ||
      '网络请求失败，请稍后重试'
    return Promise.reject(new Error(msg))
  }
)

function extract<T>(response: { data: ApiResult<T> }): T {
  const body = response.data
  if (body.code !== 0 && body.code !== 200) {
    throw new Error(body.message || '请求失败')
  }
  return body.data as T
}

// -------------------- 归一化辅助 --------------------

/** 风险等级中文 → 数字 */
function levelTextToNumber(level: string | number): number {
  if (typeof level === 'number') return level
  if (level.includes('低')) return 1
  if (level.includes('高')) return 3
  return 2 // 默认中风险
}

/** 银行名称 → scoreType */
function bankNameToScoreType(name: string): BankScore['scoreType'] {
  if (name.includes('工商')) return 'icbc'
  if (name.includes('农业')) return 'abc'
  if (name.includes('建设')) return 'ccb'
  return 'boc'
}

/** 归一化综合评分 */
function normalizeComprehensive(raw: { score: number; level: string | number; levelName?: string }): ComprehensiveScore {
  return {
    score: raw.score,
    level: typeof raw.level === 'number' ? raw.level : levelTextToNumber(raw.level),
    levelName: raw.levelName ?? (typeof raw.level === 'string' ? raw.level : '中风险'),
  }
}

/** 归一化单个银行评分（兼容两种后端格式） */
function normalizeBank(raw: any): BankScore {
  return {
    scoreType: raw.scoreType ?? bankNameToScoreType(raw.name ?? ''),
    bankName: raw.bankName ?? raw.name,
    score: Number(raw.score),
    level: typeof raw.level === 'number' ? raw.level : levelTextToNumber(raw.level ?? '中风险'),
    levelName: raw.levelName ?? (typeof raw.level === 'string' ? raw.level : '中风险'),
    trend: raw.trend ?? 'stable',
    details: raw.details,
  }
}

/** 归一化评分响应（query-score / assessment/:no） */
function normalizeQueryResponse(raw: any): QueryScoreResponse {
  return {
    comprehensive: normalizeComprehensive(raw.comprehensive),
    banks: Array.isArray(raw.banks) ? raw.banks.map(normalizeBank) : [],
    assessmentNo: raw.assessmentNo,
  }
}

// -------------------- API 方法 --------------------

/**
 * 提交查询请求
 * POST /api/h5/submit
 * 返回评估单号 + 脱敏信息 + 综合分
 */
export async function submit(params: SubmitParams): Promise<SubmitResponse> {
  const res = await instance.post('/api/h5/submit', params)
  return extract<SubmitResponse>(res)
}

/**
 * 查询评分（根据个人信息）
 * POST /api/h5/query-score
 */
export async function queryScore(params: SubmitParams): Promise<QueryScoreResponse> {
  const res = await instance.post('/api/h5/query-score', params)
  return normalizeQueryResponse(extract<any>(res))
}

/**
 * 根据评估编号查询评分
 * GET /api/h5/assessment/:no
 */
export async function getAssessment(no: string): Promise<QueryScoreResponse> {
  const res = await instance.get(`/api/h5/assessment/${no}`)
  return normalizeQueryResponse(extract<any>(res))
}