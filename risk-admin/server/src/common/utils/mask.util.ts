/**
 * 脱敏工具：列表/公开接口展示时隐藏敏感信息的部分字符
 */

/** 手机号脱敏：138****8000（保留前3后4） */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone || '';
  return phone.slice(0, 3) + '****' + phone.slice(-4);
}

/** 身份证脱敏：110101****1234（保留前6后4） */
export function maskIdCard(idCard: string): string {
  if (!idCard || idCard.length < 10) return idCard || '';
  return idCard.slice(0, 6) + '****' + idCard.slice(-4);
}

/** 姓名脱敏：张**（保留姓） */
export function maskName(name: string): string {
  if (!name || name.length <= 1) return name || '';
  return name.slice(0, 1) + '*'.repeat(name.length - 1);
}
