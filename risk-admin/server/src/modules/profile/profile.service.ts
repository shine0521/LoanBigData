import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerProfile } from '../../entities';
import { maskIdCard, maskPhone } from '../../common/utils/mask.util';
import { ProfileQueryDto } from './dto/profile-query.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(CustomerProfile)
    private readonly repo: Repository<CustomerProfile>,
  ) {}

  /** H5 提交记录列表（分页 + 筛选），返回脱敏数据 */
  async findAll(query: ProfileQueryDto) {
    const qb = this.repo.createQueryBuilder('p');

    if (query.name) {
      qb.andWhere('p.name LIKE :name', { name: `%${query.name}%` });
    }
    if (query.phone) {
      qb.andWhere('p.phone LIKE :phone', { phone: `%${query.phone}%` });
    }
    if (query.source) {
      qb.andWhere('p.submit_source = :source', { source: query.source });
    }
    if (typeof query.isCurrent === 'number') {
      qb.andWhere('p.is_current = :isCurrent', { isCurrent: query.isCurrent });
    }
    if (query.startDate) {
      qb.andWhere('p.created_at >= :start', { start: `${query.startDate} 00:00:00` });
    }
    if (query.endDate) {
      qb.andWhere('p.created_at <= :end', { end: `${query.endDate} 23:59:59` });
    }

    qb.orderBy('p.created_at', 'DESC');

    const page = query.page && query.page > 0 ? query.page : 1;
    const pageSize = query.pageSize && query.pageSize > 0 ? query.pageSize : 20;

    const [list, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    // 脱敏：身份证/手机号脱敏展示
    const items = list.map((p) => ({
      ...p,
      idCard: maskIdCard(p.idCard),
      phone: maskPhone(p.phone),
    }));

    return { list: items, total, page, pageSize };
  }
}
