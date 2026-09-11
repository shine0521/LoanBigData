import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerProfile, RiskAssessment, ScoreDetail } from '../../entities';
import { BANK_CODES, BANK_META } from '../../common/constants/risk-level';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(CustomerProfile)
    private readonly profileRepo: Repository<CustomerProfile>,
    @InjectRepository(RiskAssessment)
    private readonly raRepo: Repository<RiskAssessment>,
    @InjectRepository(ScoreDetail)
    private readonly scoreRepo: Repository<ScoreDetail>,
  ) {}

  /** 工作台统计：今日提交量、风险分布、各银行平均分 */
  async getDashboard() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 今日提交量（H5 资料提交）
    const todaySubmit = await this.profileRepo
      .createQueryBuilder('p')
      .where('p.created_at >= :s', { s: todayStart })
      .andWhere('p.created_at <= :e', { e: todayEnd })
      .getCount();

    // 今日评估量
    const todayAssessment = await this.raRepo
      .createQueryBuilder('ra')
      .where('ra.created_at >= :s', { s: todayStart })
      .andWhere('ra.created_at <= :e', { e: todayEnd })
      .getCount();

    // 风险分布（按 risk_level 聚合）
    const distRaw = await this.raRepo
      .createQueryBuilder('ra')
      .select('ra.risk_level', 'level')
      .addSelect('COUNT(*)', 'count')
      .groupBy('ra.risk_level')
      .getRawMany();

    const riskDistribution = { low: 0, mid: 0, high: 0 };
    distRaw.forEach((d) => {
      const count = Number(d.count);
      if (d.level === 1) riskDistribution.low = count;
      else if (d.level === 2) riskDistribution.mid = count;
      else if (d.level === 3) riskDistribution.high = count;
    });

    // 各银行平均分
    const bankRaw = await this.scoreRepo
      .createQueryBuilder('sd')
      .select('sd.score_type', 'bank')
      .addSelect('AVG(sd.score)', 'avg')
      .where('sd.score_type IN (:...codes)', { codes: BANK_CODES })
      .groupBy('sd.score_type')
      .getRawMany();

    const bankAverages = BANK_CODES.map((code) => {
      const row = bankRaw.find((b) => b.bank === code);
      return {
        code,
        name: BANK_META[code].name,
        shortName: BANK_META[code].shortName,
        avg: row ? Math.round(Number(row.avg)) : 0,
      };
    });

    return {
      todaySubmit,
      todayAssessment,
      riskDistribution,
      bankAverages,
    };
  }
}
