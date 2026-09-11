import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Request } from 'express';
import {
  Customer,
  CustomerProfile,
  RiskAssessment,
  ScoreDetail,
  SyncRecord,
} from '../../entities';
import { aesEncrypt, sha256 } from '../../common/utils/crypto.util';
import { maskIdCard, maskName, maskPhone } from '../../common/utils/mask.util';
import {
  BANK_META,
  levelToName,
} from '../../common/constants/risk-level';
import { SyncGateway } from '../../websocket/sync.gateway';
import { ScoringService } from '../assessment/scoring.service';
import { ApiException } from '../../common/exceptions/api.exception';
import { H5SubmitDto } from './dto/submit.dto';
import { QueryScoreDto } from './dto/query-score.dto';

@Injectable()
export class H5Service {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly syncGateway: SyncGateway,
    private readonly scoringService: ScoringService,
  ) {}

  /** 生成评估单号 R + 日期 + 4位随机 */
  private genAssessmentNo(): string {
    const d = new Date();
    const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(
      d.getDate(),
    ).padStart(2, '0')}`;
    const rand = Math.floor(Math.random() * 9000) + 1000;
    return `R${ymd}${rand}`;
  }

  /**
   * H5 提交：事务内完成 查/建客户 -> 写资料 -> 创建评估 -> Mock评分 -> 写同步日志 -> WS广播
   */
  async submit(dto: H5SubmitDto, req?: Request) {
    const idCardHash = sha256(dto.idCard);
    const encryptedIdCard = aesEncrypt(dto.idCard); // 占位加密
    const submitIp =
      (req && (req.ip || (req.headers['x-forwarded-for'] as string))) || null;
    const userAgent = (req && (req.headers['user-agent'] as string)) || null;

    // 在事务中保证一致性
    const assessment = await this.dataSource.transaction(async (manager) => {
      const customerRepo = manager.getRepository(Customer);
      const profileRepo = manager.getRepository(CustomerProfile);
      const raRepo = manager.getRepository(RiskAssessment);
      const scoreRepo = manager.getRepository(ScoreDetail);
      const syncRepo = manager.getRepository(SyncRecord);

      // 1. 按 id_card_hash 查/建客户
      let customer = await customerRepo.findOne({ where: { idCardHash } });
      if (!customer) {
        customer = customerRepo.create({
          customerNo: `C${Date.now()}${Math.floor(Math.random() * 1000)}`,
          name: dto.name,
          idCard: encryptedIdCard,
          idCardHash,
          phone: dto.phone,
          source: 'h5',
        });
        customer = await customerRepo.save(customer);
      }

      // 2. 旧版本资料置为非当前
      await manager
        .createQueryBuilder()
        .update(CustomerProfile)
        .set({ isCurrent: 0 })
        .where('customer_id = :cid AND is_current = 1', { cid: customer.id })
        .execute();

      // 计算新版本号
      const maxVer = await profileRepo
        .createQueryBuilder('p')
        .select('MAX(p.version)', 'max')
        .where('p.customer_id = :cid', { cid: customer.id })
        .getRawOne();
      const version = (maxVer?.max ?? 0) + 1;

      // 3. 写入当前有效资料
      const profile = profileRepo.create();
      profile.customerId = customer.id;
      profile.name = dto.name;
      profile.idCard = encryptedIdCard;
      profile.phone = dto.phone;
      profile.submitSource = 'h5';
      profile.submitIp = submitIp;
      profile.userAgent = userAgent;
      profile.version = version;
      profile.isCurrent = 1;
      const savedProfile = await profileRepo.save(profile);

      // 4. Mock 评分（确定性）
      const result = this.scoringService.generate(dto.idCard);

      // 5. 创建评估记录（状态：完成）
      const ra = raRepo.create({
        assessmentNo: this.genAssessmentNo(),
        customerId: customer.id,
        profileId: savedProfile.id,
        comprehensiveScore: result.comprehensive,
        riskLevel: result.comprehensiveLevel,
        status: 2, // 完成
        calcSource: 'auto',
        assessedAt: new Date(),
      });
      const savedRa = await raRepo.save(ra);

      // 6. 写入评分明细（综合 + 四行）
      const rows: ScoreDetail[] = [
        scoreRepo.create({
          assessmentId: savedRa.id,
          scoreType: 'comprehensive',
          score: result.comprehensive,
          riskLevel: result.comprehensiveLevel,
          trend: 'stable',
          isManual: 0,
        }),
      ];
      for (const b of result.banks) {
        rows.push(
          scoreRepo.create({
            assessmentId: savedRa.id,
            scoreType: b.code,
            score: b.score,
            riskLevel: b.level,
            trend: b.trend,
            dimensions: { details: b.details },
            isManual: 0,
          }),
        );
      }
      await scoreRepo.save(rows);

      // 7. 写入同步日志（待推送）
      const sync = syncRepo.create({
        bizType: 'assessment',
        bizId: savedRa.id,
        action: 'create',
        payload: {
          assessmentNo: savedRa.assessmentNo,
          customerId: customer.id,
          profileId: savedProfile.id,
          name: dto.name,
          phone: dto.phone,
        },
        syncStatus: 0,
      });
      await syncRepo.save(sync);

      return savedRa;
    });

    // 事务提交后，广播新提交事件（脱敏）
    this.syncGateway.notifyNewSubmit({
      profileId: assessment.profileId,
      customerId: assessment.customerId,
      name: maskName(dto.name),
      phone: maskPhone(dto.phone),
      assessmentNo: assessment.assessmentNo,
    });

    return {
      assessmentNo: assessment.assessmentNo,
      name: maskName(dto.name),
      phone: maskPhone(dto.phone),
      comprehensive: {
        score: assessment.comprehensiveScore,
        level: levelToName(assessment.riskLevel),
      },
    };
  }

  /**
   * 查询评分结果
   * 支持按 assessmentNo 或 name+idCard+phone
   */
  async queryScore(dto: QueryScoreDto) {
    let assessment: RiskAssessment | null = null;

    if (dto.assessmentNo) {
      assessment = await this.findRaByNo(dto.assessmentNo);
    } else if (dto.name && dto.idCard && dto.phone) {
      const idCardHash = sha256(dto.idCard);
      const customer = await this.findOneCustomerByHash(idCardHash);
      if (customer) {
        assessment = await this.findLatestRaByCustomer(customer.id);
      }
    }

    if (!assessment) {
      // 与 H5 方案文档一致：code 1002 未查到
      throw new ApiException(1002, '未查询到该用户的风险评分信息', 404);
    }

    return this.buildScoreResponse(assessment);
  }

  /** 评估详情（公开，脱敏展示） */
  async getAssessment(no: string) {
    const assessment = await this.findRaByNo(no);
    if (!assessment) {
      throw new ApiException(1002, '未查询到该评估记录', 404);
    }
    const customer = await this.findOneCustomer(assessment.customerId);
    const scoreDetails = await this.scoreRepo().find({
      where: { assessmentId: assessment.id },
      order: { id: 'ASC' },
    });

    const comprehensive = scoreDetails.find((s) => s.scoreType === 'comprehensive');
    const banks = scoreDetails
      .filter((s) => s.scoreType !== 'comprehensive')
      .map((s) => ({
        scoreType: s.scoreType,
        score: s.score,
        level: s.riskLevel,
        levelName: levelToName(s.riskLevel),
        trend: s.trend,
        isManual: s.isManual,
      }));

    return {
      assessmentNo: assessment.assessmentNo,
      createdAt: assessment.createdAt,
      comprehensive: comprehensive
        ? {
            score: comprehensive.score,
            level: comprehensive.riskLevel,
            levelName: levelToName(comprehensive.riskLevel),
          }
        : null,
      customer: customer
        ? {
            name: maskName(customer.name),
            phone: maskPhone(customer.phone),
            idCard: maskIdCard(customer.idCard), // 注意：此处为加密串，仅占位脱敏
          }
        : null,
      banks,
    };
  }

  // ---------- 内部辅助 ----------

  private scoreRepo() {
    return this.dataSource.getRepository(ScoreDetail);
  }

  private async findRaByNo(no: string) {
    return this.dataSource.getRepository(RiskAssessment).findOne({
      where: { assessmentNo: no },
    });
  }

  private async findOneCustomer(id: number) {
    return this.dataSource.getRepository(Customer).findOne({ where: { id } });
  }

  private async findOneCustomerByHash(hash: string) {
    return this.dataSource.getRepository(Customer).findOne({
      where: { idCardHash: hash },
    });
  }

  private async findLatestRaByCustomer(customerId: number) {
    return this.dataSource
      .getRepository(RiskAssessment)
      .findOne({ where: { customerId }, order: { id: 'DESC' } });
  }

  /** 将评估记录 + 评分明细组装为 H5 期望结构 */
  private async buildScoreResponse(assessment: RiskAssessment) {
    const scoreDetails = await this.scoreRepo().find({
      where: { assessmentId: assessment.id },
    });

    const comprehensive = scoreDetails.find((s) => s.scoreType === 'comprehensive');

    const banks = scoreDetails
      .filter((s) => s.scoreType !== 'comprehensive')
      .map((s) => {
        const meta = BANK_META[s.scoreType];
        return {
          name: meta?.name ?? s.scoreType,
          shortName: meta?.shortName ?? s.scoreType,
          score: s.score,
          level: s.riskLevel,
          levelName: levelToName(s.riskLevel),
          trend: s.trend,
          details: (s.dimensions as any)?.details ?? [],
        };
      });

    return {
      comprehensive: {
        score: comprehensive?.score ?? assessment.comprehensiveScore,
        level: levelToName(comprehensive?.riskLevel ?? assessment.riskLevel),
      },
      banks,
    };
  }
}
