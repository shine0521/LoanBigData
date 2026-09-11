import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OperationLog } from '../../entities';

/**
 * 操作日志服务
 * 统一记录写操作前后快照（基础版：采用 service 注入方式）。
 * 用法：在写操作（新增/编辑/删除）完成后调用 record()。
 */
@Injectable()
export class LogService {
  constructor(
    @InjectRepository(OperationLog)
    private readonly logRepo: Repository<OperationLog>,
  ) {}

  /**
   * 记录一条操作日志
   */
  async record(opts: {
    operatorId: number;
    operator?: string;
    module: string;
    action: string;
    targetType?: string;
    targetId?: number;
    beforeData?: Record<string, any>;
    afterData?: Record<string, any>;
    ip?: string;
  }): Promise<OperationLog> {
    const log = this.logRepo.create({
      operatorId: opts.operatorId,
      operator: opts.operator,
      module: opts.module,
      action: opts.action,
      targetType: opts.targetType,
      targetId: opts.targetId,
      beforeData: opts.beforeData,
      afterData: opts.afterData,
      ip: opts.ip,
    });
    return this.logRepo.save(log);
  }

  /** 查询操作日志列表（分页） */
  async list(query: { page?: number; pageSize?: number; module?: string }) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const pageSize =
      query.pageSize && query.pageSize > 0 ? query.pageSize : 20;

    const qb = this.logRepo.createQueryBuilder('log');
    if (query.module) {
      qb.andWhere('log.module = :module', { module: query.module });
    }
    qb.orderBy('log.created_at', 'DESC');

    const [list, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { list, total, page, pageSize };
  }
}
