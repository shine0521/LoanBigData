import { Injectable } from '@nestjs/common';
import {
  BANK_CODES,
  BANK_META,
  scoreToLevel,
} from '../../common/constants/risk-level';

/**
 * Mock 评分服务（无真实模型）
 *
 * 关键特性：确定性（deterministic）
 *  - 由身份证号派生固定种子（FNV-1a）
 *  - 使用线性同余发生器（LCG）派生伪随机数
 *  - 因此同一身份证号多次评分结果稳定一致
 *
 * 生成：综合分(0-1000) + 中行(boc)/工行(icbc)/农行(abc)/建行(ccb) 四行分
 * 风险等级映射：800-1000 低(1) / 600-799 中(2) / 0-599 高(3)
 */
@Injectable()
export class ScoringService {
  /**
   * 由身份证号派生确定性种子
   */
  private seedFromIdCard(idCard: string): number {
    let h = 2166136261; // FNV offset basis
    for (let i = 0; i < idCard.length; i++) {
      h ^= idCard.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0; // FNV-1a
    }
    return h >>> 0;
  }

  /**
   * 线性同余发生器，返回 [0,1)
   * state 为可变对象，便于连续取多个确定性随机数
   */
  private lcg(state: { s: number }): number {
    state.s = (Math.imul(state.s, 1103515245) + 12345) >>> 0;
    return state.s / 0x7fffffff;
  }

  /** 由状态生成 0-1000 的分数（可叠加偏移，并裁剪到合法区间） */
  private scoreFromSeed(state: { s: number }, bias = 0): number {
    const base = Math.floor(this.lcg(state) * 1001); // 0-1000
    return Math.max(0, Math.min(1000, base + bias));
  }

  private trendFromSeed(state: { s: number }): string {
    const r = this.lcg(state);
    if (r < 0.34) return 'up';
    if (r < 0.67) return 'down';
    return 'stable';
  }

  /** 根据风险等级生成提示文案（占位） */
  private detailsFor(level: number): string[] {
    switch (level) {
      case 1:
        return ['信用记录良好', '负债率正常'];
      case 2:
        return ['信用记录一般', '负债率偏高'];
      default:
        return ['近期查询次数较多', '存在逾期风险'];
    }
  }

  /**
   * 生成评分结果
   * 每个分数在 600-650 之间随机生成
   * 风险等级映射：800-1000 低(1) / 600-799 中(2) / 0-599 高(3)
   * 600-650 落在中风险区间
   */
  generate(_idCard: string): ScoreResult {
    // 综合分：600-650 随机
    const comprehensive = 600 + Math.floor(Math.random() * 51);
    const comprehensiveLevel = scoreToLevel(comprehensive);

    const banks = BANK_CODES.map((code) => {
      const meta = BANK_META[code];
      // 每个银行分数：600-650 随机
      const score = 600 + Math.floor(Math.random() * 51);
      const level = scoreToLevel(score);
      const trend = this.trendFromSeed({ s: Math.floor(Math.random() * 0xffffffff) });
      return {
        code,
        name: meta.name,
        shortName: meta.shortName,
        score,
        level,
        trend,
        details: this.detailsFor(level),
      };
    });

    return { comprehensive, comprehensiveLevel, banks };
  }
}

export interface BankScore {
  code: string;
  name: string;
  shortName: string;
  score: number;
  level: number;
  trend: string;
  details: string[];
}

export interface ScoreResult {
  comprehensive: number;
  comprehensiveLevel: number;
  banks: BankScore[];
}
