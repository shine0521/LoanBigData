/**
 * 风险等级常量与映射
 * 评分映射：800-1000 低(1) / 600-799 中(2) / 0-599 高(3)
 */
export const RISK_LEVEL = {
  LOW: 1, // 低风险
  MID: 2, // 中风险
  HIGH: 3, // 高风险
} as const;

/** 分数 -> 风险等级 code（1低 2中 3高） */
export function scoreToLevel(score: number): number {
  if (score >= 800) return RISK_LEVEL.LOW;
  if (score >= 600) return RISK_LEVEL.MID;
  return RISK_LEVEL.HIGH;
}

/** 风险等级 code -> 中文名 */
export function levelToName(level: number): string {
  switch (level) {
    case RISK_LEVEL.LOW:
      return '低风险';
    case RISK_LEVEL.MID:
      return '中风险';
    case RISK_LEVEL.HIGH:
      return '高风险';
    default:
      return '未知';
  }
}

/** 风险等级 code -> 颜色（与 H5 端配色保持一致） */
export function levelToColor(level: number): string {
  switch (level) {
    case RISK_LEVEL.LOW:
      return '#00C853';
    case RISK_LEVEL.MID:
      return '#FF9900';
    case RISK_LEVEL.HIGH:
      return '#FF3D00';
    default:
      return '#999999';
  }
}

/** 四家银行编码 -> 名称/简称映射 */
export const BANK_META: Record<string, { name: string; shortName: string }> = {
  boc: { name: '中国银行', shortName: '中行' },
  icbc: { name: '中国工商银行', shortName: '工行' },
  abc: { name: '中国农业银行', shortName: '农行' },
  ccb: { name: '中国建设银行', shortName: '建行' },
};

/** 四家银行编码顺序 */
export const BANK_CODES = ['boc', 'icbc', 'abc', 'ccb'];
