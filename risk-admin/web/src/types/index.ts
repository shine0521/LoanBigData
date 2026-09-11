// ===================== 通用 =====================
// 统一响应结构
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 分页参数
export interface PageParams {
  page: number
  pageSize: number
}

// 分页结果
export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// ===================== 登录 =====================
export interface LoginForm {
  username: string
  password: string
  captcha: string
  captchaKey: string
}

export interface LoginResult {
  token: string
  user: AdminUser
}

// ===================== 管理员 =====================
export interface AdminUser {
  id: number
  username: string
  realName: string
  phone: string
  email: string
  role: string // super_admin / operator / viewer
  status: number
  lastLoginAt: string
  createdAt: string
}

// ===================== 客户 =====================
export interface Customer {
  id: number
  customerNo: string
  name: string
  idCard: string // 脱敏后显示
  phone: string  // 脱敏后显示
  gender: number // 1男 2女 0未知
  birthday: string
  status: number
  source: string
  remark: string
  riskLevel: number | null // 1低 2中 3高
  createdAt: string
  updatedAt: string
}

export interface CustomerForm {
  name: string
  idCard: string
  phone: string
  gender?: number
  birthday?: string
  remark?: string
}

// ===================== 资料记录 (H5 提交) =====================
export interface CustomerProfile {
  id: number
  customerId: number
  name: string
  idCard: string  // 脱敏
  phone: string   // 脱敏
  submitSource: string
  submitIp: string
  isCurrent: number
  createdAt: string
  // 关联的评估信息（可选）
  assessmentNo?: string
  riskLevel?: number
  comprehensiveScore?: number
}

export interface ProfileFilter {
  keyword?: string
  riskLevel?: number
  startDate?: string
  endDate?: string
  page: number
  pageSize: number
}

// ===================== 评分记录 =====================
export type ScoreType = 'comprehensive' | 'boc' | 'icbc' | 'abc' | 'ccb'

// 风险等级: 1=低风险, 2=中风险, 3=高风险
export const RISK_LEVEL_MAP: Record<number, string> = {
  1: '低风险',
  2: '中风险',
  3: '高风险',
}

export const RISK_LEVEL_COLOR: Record<number, string> = {
  1: '#52c41a', // 绿色
  2: '#faad14', // 橙色
  3: '#ff4d4f', // 红色
}

export interface ScoreDetail {
  id: number
  assessmentId: number
  scoreType: ScoreType
  score: number
  riskLevel: number // 1低 2中 3高
  trend: string // up / down / stable
  dimensions: any
  isManual: number
  manualReason: string
  operatorId: number
  createdAt: string
  updatedAt: string
}

export interface Assessment {
  id: number
  assessmentNo: string
  customerId: number
  profileId: number
  comprehensiveScore: number | null
  riskLevel: number | null
  status: number // 0待处理 1计算中 2完成 3失败
  calcSource: string
  failReason: string
  assessedAt: string
  createdAt: string
  // 关联信息
  customerName?: string
  // 各银行评分
  bocScore?: number
  icbcScore?: number
  abcScore?: number
  ccbScore?: number
}

export interface AssessmentDetail extends Assessment {
  customerName: string
  customerNo: string
  scores: ScoreDetail[]
}

export interface AssessmentFilter {
  keyword?: string
  riskLevel?: number
  startDate?: string
  endDate?: string
  page: number
  pageSize: number
}

// ===================== 工作台 =====================
export interface DashboardData {
  todaySubmitCount: number    // 今日提交量
  todayQueryCount: number     // 今日查询量
  totalCustomerCount: number  // 客户总数
  riskDistribution: {
    low: number   // 低风险人数
    medium: number
    high: number
  }
  bankAvgScores: {
    boc: number
    icbc: number
    abc: number
    ccb: number
  }
  recentProfiles: CustomerProfile[]
}

// ===================== WebSocket 推送消息 =====================
export interface WsNotifyMessage {
  event: string
  timestamp: string
  data: {
    profileId: number
    customerId: number
    name: string
    phone: string
    assessmentNo?: string
  }
}

// ===================== 操作日志 =====================
export interface OperationLog {
  id: number
  operatorId: number
  operator: string
  module: string
  action: string
  targetType: string
  targetId: number
  beforeData: any
  afterData: any
  ip: string
  createdAt: string
}
