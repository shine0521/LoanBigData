// ============================================
// 表单校验工具函数
// ============================================

/**
 * 校验姓名
 * 规则：2-20位中文，或 2-20位英文字母（不支持混合）
 */
export function validateName(value: string): boolean {
  const trimmed = value.trim()
  // 纯中文：2-20个汉字
  const cnPattern = /^[\u4e00-\u9fa5]{2,20}$/
  // 纯英文：2-20个字母
  const enPattern = /^[a-zA-Z]{2,20}$/
  return cnPattern.test(trimmed) || enPattern.test(trimmed)
}

/**
 * 校验身份证号格式（18位 + 校验码）
 * 规则：前17位为数字，最后一位为数字或X/x
 */
export function validateIdCardFormat(value: string): boolean {
  return /^\d{17}[\dXx]$/.test(value)
}

/**
 * 计算身份证校验码
 * @param idCard 18位身份证号（前17位）
 * @returns 校验码（0-9 或 X）
 */
export function getIdCardCheckCode(idCard: string): string {
  if (idCard.length !== 17) return ''
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
  let sum = 0
  for (let i = 0; i < 17; i++) {
    sum += parseInt(idCard[i], 10) * weights[i]
  }
  return checkCodes[sum % 11]
}

/**
 * 完整校验身份证号（格式 + 校验码）
 */
export function validateIdCard(value: string): boolean {
  const upper = value.toUpperCase()
  if (!validateIdCardFormat(upper)) return false
  const checkCode = getIdCardCheckCode(upper.slice(0, 17))
  return upper[17] === checkCode
}

/**
 * 校验手机号
 * 规则：1开头，第二位3-9，共11位
 */
export function validatePhone(value: string): boolean {
  return /^1[3-9]\d{9}$/.test(value)
}

/**
 * 获取校验错误提示
 */
export function getNameError(value: string): string {
  if (!value.trim()) return '请输入姓名'
  if (!validateName(value)) return '姓名格式不正确（2-20位中文或英文）'
  return ''
}

export function getIdCardError(value: string): string {
  if (!value.trim()) return '请输入身份证号'
  if (!validateIdCardFormat(value)) return '身份证号格式不正确'
  // 格式通过后再提示校验码错误
  if (!validateIdCard(value)) return '身份证号校验码不正确'
  return ''
}

export function getPhoneError(value: string): string {
  if (!value.trim()) return '请输入手机号'
  if (!validatePhone(value)) return '手机号格式不正确'
  return ''
}

/**
 * 校验员工号
 * 规则：6 位数字
 *   - 第 1 位固定为 0
 *   - 后 5 位每位只能是 1 / 2 / 3
 * 例：0 1 2 3 1 2 → "012312"
 * 后 5 位依次对应：中行 / 工行 / 农行 / 建行 / 综合评分
 */
export function validateStaffId(value: string): boolean {
  return /^0[123]{5}$/.test(value.trim())
}

export function getStaffIdError(value: string): string {
  const v = value.trim()
  if (!v) return '请输入员工号'
  if (v.length !== 6) return '员工号必须为6位数字'
  if (v[0] !== '0') return '员工号第1位必须为0'
  if (!/^[123]{5}$/.test(v.slice(1))) return '员工号后5位只能由1、2、3组成'
  return ''
}
