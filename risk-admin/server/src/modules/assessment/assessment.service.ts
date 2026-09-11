import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  Customer,
  RiskAssessment,
  ScoreDetail,
} from '../../entities';
import { aesDecrypt } from '../../common/utils/crypto.util';
import { scoreToLevel } from '../../common/constants/risk-level';
import { LogService } from '../log/log.service';
import { ScoringService } from './scoring.service';
import { AssessmentQueryDto } from './dto/assessment-query.dto';
import { ScoresUpdateDto } from './dto/scores-update.dto';

interface Operator {
  id?: number;
  username?: string;
}

@Injectable()
export class AssessmentService {
  constructor(
    @InjectRepository(RiskAssessment)
    private readonly raRepo: Repository<RiskAssessment>,
    @InjectRepository(ScoreDetail)
    private readonly scoreRepo: Repository<ScoreDetail>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    private readonly scoringService: ScoringService,
    private readonly logService: LogService,
  ) {}

  /** 评估记录列表（分页 + 筛选），附带客户姓名 */
  async findAll(query: AssessmentQueryDto) {
    const qb = this.raRepo.createQueryBuilder('ra');

    if (query.name) {
      qb.andWhere(
        'ra.customer_id IN (SELECT id FROM customer WHERE name LIKE :name)',
        { name: `%${query.name}%` },
      );
    }
    if (query.riskLevel) {
      qb.andWhere('ra.risk_level = :rl', { rl: query.riskLevel });
    }
    if (query.startDate) {
      qb.andWhere('ra.created_at >= :start', { start: `${query.startDate} 00:00:00` });
    }
    if (query.endDate) {
      qb.andWhere('ra.created_at <= :end', { end: `${query.endDate} 23:59:59` });
    }

    qb.orderBy('ra.created_at', 'DESC');

    const page = query.page && query.page > 0 ? query.page : 1;
    const pageSize = query.pageSize && query.pageSize > 0 ? query.pageSize : 20;

    const [list, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    // 批量补齐客户姓名
    const customerIds = [...new Set(list.map((a) => a.customerId))];
    const customers = await this.customerRepo.find({
      where: { id: In(customerIds) },
    });
    const customerMap = new Map(customers.map((c) => [c.id, c]));

    const items = list.map((a) => ({
      ...a,
      customerName: customerMap.get(a.customerId)?.name ?? null,
    }));

    return { list: items, total, page, pageSize };
  }

  /** 评估详情（含 score_detail 五条：综合 + 四行） */
  async findDetail(id: number) {
    const assessment = await this.raRepo.findOne({ where: { id } });
    if (!assessment) throw new NotFoundException('评估记录不存在');

    const scoreDetails = await this.scoreRepo.find({
      where: { assessmentId: id },
      order: { id: 'ASC' },
    });

    return { assessment, scoreDetail: scoreDetails };
  }

  /**
   * 手动重算（占位）
   * 重新调用 Mock 评分服务生成分数并回写 score_detail 与 assessment。
   * 通过占位 AES 解密身份证还原明文作为评分种子。
   */
  async recalc(id: number, operator?: Operator) {
    const assessment = await this.raRepo.findOne({ where: { id } });
    if (!assessment) throw new NotFoundException('评估记录不存在');

    const customer = await this.customerRepo.findOne({
      where: { id: assessment.customerId },
    });
    if (!customer) throw new NotFoundException('客户不存在');

    // 占位：AES 解密身份证得到明文（生产替换为安全解密）
    const plainIdCard = aesDecrypt(customer.idCard);
    const result = this.scoringService.generate(plainIdCard);

    // 删除旧明细，重新写入
    await this.scoreRepo.delete({ assessmentId: id });

    const rows: ScoreDetail[] = [];
    rows.push(
      this.scoreRepo.create({
        assessmentId: id,
        scoreType: 'comprehensive',
        score: result.comprehensive,
        riskLevel: result.comprehensiveLevel,
        trend: 'stable',
        isManual: 0,
      }),
    );
    for (const b of result.banks) {
      rows.push(
        this.scoreRepo.create({
          assessmentId: id,
          scoreType: b.code,
          score: b.score,
          riskLevel: b.level,
          trend: b.trend,
          dimensions: { details: b.details },
          isManual: 0,
        }),
      );
    }
    await this.scoreRepo.save(rows);

    assessment.comprehensiveScore = result.comprehensive;
    assessment.riskLevel = result.comprehensiveLevel;
    assessment.status = 2; // 完成
    assessment.calcSource = 'manual';
    assessment.assessedAt = new Date();
    const saved = await this.raRepo.save(assessment);

    await this.logService.record({
      operatorId: operator?.id ?? 0,
      operator: operator?.username,
      module: 'assessment',
      action: 'recalc',
      targetType: 'risk_assessment',
      targetId: id,
      afterData: { comprehensiveScore: saved.comprehensiveScore, riskLevel: saved.riskLevel },
    });

    return this.findDetail(id);
  }

  /**
   * 人工修正评分（写 is_manual / manual_reason）
   * :id 为 score_detail 主键
   */
  async correctScore(scoreId: number, dto: ScoresUpdateDto, operator?: Operator) {
    const sd = await this.scoreRepo.findOne({ where: { id: scoreId } });
    if (!sd) throw new NotFoundException('评分明细不存在');

    const before = {
      score: sd.score,
      riskLevel: sd.riskLevel,
      isManual: sd.isManual,
      manualReason: sd.manualReason,
    };

    sd.score = dto.score;
    sd.riskLevel = dto.riskLevel ?? scoreToLevel(dto.score);
    sd.isManual = 1;
    sd.manualReason = dto.manualReason;
    sd.operatorId = operator?.id ?? null;

    const saved = await this.scoreRepo.save(sd);

    // 若是综合分，同步更新 assessment 的综合分与等级
    if (sd.scoreType === 'comprehensive') {
      await this.raRepo.update(saved.assessmentId, {
        comprehensiveScore: saved.score,
        riskLevel: saved.riskLevel,
      });
    }

    await this.logService.record({
      operatorId: operator?.id ?? 0,
      operator: operator?.username,
      module: 'score',
      action: 'manual_correct',
      targetType: 'score_detail',
      targetId: scoreId,
      beforeData: before,
      afterData: {
        score: saved.score,
        riskLevel: saved.riskLevel,
        manualReason: saved.manualReason,
      },
    });

    return saved;
  }
}
