import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUser } from '../../entities';
import { PageQueryDto } from '../../common/dto/page-query.dto';

/**
 * 管理员账号服务（基础版：列表查询）
 * 默认账号 admin/123456 由 auth 模块内存校验，此处仅提供账号表的增删改查骨架。
 */
@Injectable()
export class AdminUserService {
  constructor(
    @InjectRepository(AdminUser)
    private readonly repo: Repository<AdminUser>,
  ) {}

  async list(query: PageQueryDto) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const pageSize = query.pageSize && query.pageSize > 0 ? query.pageSize : 20;

    const [list, total] = await this.repo
      .createQueryBuilder('u')
      .orderBy('u.created_at', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }
}
