// ============================================
// 格式化工具函数
// ============================================

/**
 * 身份证号脱敏
 * 显示前6位 + **** + 后4位
 * 示例：110101199001011234 → 110101********1234
 */
export function maskIdCard(idCard: string): string {
  if (!idCard || idCard.length < 10) return idCard
  const front = idCard.slice(0, 6)
  const back = idCard.slice(-4)
  return `${front}********${back}`
}

/**
 * 手机号脱敏
 * 显示前3位 + **** + 后4位
 * 示例：13800138000 → 138****8000
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone
  const front = phone.slice(0, 3)
  const back = phone.slice(-4)
  return `${front}****${back}`
}

/**
 * 姓名脱敏
 * 显示姓 + **（保留姓氏）
 * 示例：张三 → 张*，欧阳娜娜 → 欧***
 */
export function maskName(name: string): string {
  if (!name) return ''
  // 中文姓名
  if (/^[\u4e00-\u9fa5]+$/.test(name)) {
    if (name.length === 2) {
      return name[0] + '*'
    }
    return name.slice(0, 2) + '*'.repeat(name.length - 2)
  }
  // 英文姓名
  if (/^[a-zA-Z\s]+$/.test(name)) {
    const parts = name.trim().split(/\s+/)
    return parts.map(p => p[0] + '*'.repeat(p.length - 1)).join(' ')
  }
  return name[0] + '*'.repeat(name.length - 1)
}

/**
 * 格式化日期时间
 * 示例：2026-09-11 19:55
 */
export function formatDateTime(date?: Date): string {
  const d = date || new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/**
 * 风险等级颜色映射
 */
export function getRiskColor(level: '低风险' | '中风险' | '高风险'): string {
  const map: Record<string, string> = {
    '低风险': '#00C853',
    '中风险': '#FF9900',
    '高风险': '#FF3D00',
  }
  return map[level] || '#999999'
}

/**
 * 风险等级文字颜色类
 */
export function getRiskColorClass(level: '低风险' | '中风险' | '高风险'): string {
  const map: Record<string, string> = {
    '低风险': 'risk-low',
    '中风险': 'risk-medium',
    '高风险': 'risk-high',
  }
  return map[level] || ''
}
