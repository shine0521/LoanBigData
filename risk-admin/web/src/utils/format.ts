/**
 * 工具函数
 */

/**
 * 脱敏手机号：前3后4
 * 13800138000 → 138****8000
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone
  return phone.slice(0, 3) + '****' + phone.slice(-4)
}

/**
 * 脱敏身份证：前6后4
 * 110101199001011234 → 110101********1234
 */
export function maskIdCard(idCard: string): string {
  if (!idCard || idCard.length < 10) return idCard
  return idCard.slice(0, 6) + '********' + idCard.slice(-4)
}

/**
 * 脱敏姓名：只保留首尾字
 * 张三 → 张*
 * 李明 → 李*
 * 欧阳锋 → 欧*锋
 */
export function maskName(name: string): string {
  if (!name || name.length === 1) return name
  if (name.length === 2) return name[0] + '*'
  return name[0] + '*' + name[name.length - 1]
}

/**
 * 格式化日期
 */
export function formatDate(date: string | Date, fmt: string = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return fmt
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 格式化日期（短格式）
 */
export function formatDateShort(date: string | Date): string {
  return formatDate(date, 'YYYY-MM-DD')
}

/**
 * 性别文字
 */
export function formatGender(gender: number): string {
  const map: Record<number, string> = { 1: '男', 2: '女', 0: '未知' }
  return map[gender] ?? '未知'
}

/**
 * 风险等级文字
 */
export function formatRiskLevel(level: number | null | undefined): string {
  if (level == null) return '-'
  const map: Record<number, string> = { 1: '低风险', 2: '中风险', 3: '高风险' }
  return map[level] ?? '-'
}

/**
 * 风险等级颜色
 */
export function getRiskLevelColor(level: number | null | undefined): string {
  if (level == null) return '#909399'
  const map: Record<number, string> = { 1: '#52c41a', 2: '#faad14', 3: '#ff4d4f' }
  return map[level] ?? '#909399'
}

/**
 * 风险等级对应数值（低=1, 中=2, 高=3）
 */
export function parseRiskLevel(levelStr: string): number {
  const map: Record<string, number> = {
    '低风险': 1, '低': 1, 'low': 1,
    '中风险': 2, '中': 2, 'medium': 2, 'mid': 2,
    '高风险': 3, '高': 3, 'high': 3,
  }
  return map[levelStr] ?? 0
}
