import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../entities';
import { aesEncrypt, sha256 } from '../../common/utils/crypto.util';
import { maskPhone } from '../../common/utils/mask.util';
import { LogService } from '../log/log.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerQueryDto } from './dto/customer-query.dto';
import { ImportCustomerDto } from './dto/import-customer.dto';

/** 操作人上下文（由 @CurrentUser 注入） */
interface Operator {
  id?: number;
  username?: string;
}

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly repo: Repository<Customer>,
    private readonly logService: LogService,
  ) {}

  /** 生成客户编号 C + 日期 + 4位随机 */
  private genCustomerNo(): string {
    const d = new Date();
    const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(
      d.getDate(),
    ).padStart(2, '0')}`;
    const rand = Math.floor(Math.random() * 9000) + 1000;
    return `C${ymd}${rand}`;
  }

  /** 新增客户（含身份证加密 + SHA256 哈希去重） */
  async create(dto: CreateCustomerDto, operator?: Operator) {
    const idCardHash = sha256(dto.idCard);
    const exist = await this.repo.findOne({ where: { idCardHash } });
    if (exist) {
      throw new BadRequestException('该身份证号已存在');
    }

    const customer = this.repo.create({
      customerNo: this.genCustomerNo(),
      name: dto.name,
      // TODO: 占位加密，生产使用 AES-256-GCM + 密钥托管
      idCard: aesEncrypt(dto.idCard),
      idCardHash,
      phone: dto.phone,
      gender: dto.gender,
      birthday: dto.birthday,
      remark: dto.remark,
      source: dto.source || 'admin',
    });

    const saved = await this.repo.save(customer);

    // 写操作日志（基础版：service 注入方式）
    await this.logService.record({
      operatorId: operator?.id ?? 0,
      operator: operator?.username,
      module: 'customer',
      action: 'create',
      targetType: 'customer',
      targetId: saved.id,
      afterData: this.toLogData(saved),
    });

    return saved;
  }

  /** 客户列表（分页 + 搜索 name/phone/riskLevel） */
  async findAll(query: CustomerQueryDto) {
    const qb = this.repo.createQueryBuilder('c');

    if (query.name) {
      qb.andWhere('c.name LIKE :name', { name: `%${query.name}%` });
    }
    if (query.phone) {
      qb.andWhere('c.phone LIKE :phone', { phone: `%${query.phone}%` });
    }
    if (query.riskLevel) {
      // 按最新评估的风险等级过滤（customer 表本身无 risk_level 字段）
      qb.andWhere(
        'c.id IN (SELECT customer_id FROM risk_assessment WHERE risk_level = :rl)',
        { rl: query.riskLevel },
      );
    }

    qb.orderBy('c.created_at', 'DESC');

    const page = query.page && query.page > 0 ? query.page : 1;
    const pageSize = query.pageSize && query.pageSize > 0 ? query.pageSize : 20;

    const [list, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    // 脱敏：手机号脱敏（身份证为加密存储，列表不直接返回明文）
    const items = list.map((c) => ({
      ...c,
      phone: maskPhone(c.phone),
    }));

    return { list: items, total, page, pageSize };
  }

  async findOne(id: number) {
    const customer = await this.repo.findOne({ where: { id } });
    if (!customer) throw new NotFoundException('客户不存在');
    return customer;
  }

  /** 编辑客户 */
  async update(id: number, dto: UpdateCustomerDto, operator?: Operator) {
    const customer = await this.findOne(id);
    const before = this.toLogData(customer);

    if (dto.idCard && dto.idCard !== customer.idCard) {
      const idCardHash = sha256(dto.idCard);
      const conflict = await this.repo.findOne({ where: { idCardHash } });
      if (conflict && conflict.id !== id) {
        throw new BadRequestException('该身份证号已被其他客户使用');
      }
      customer.idCard = aesEncrypt(dto.idCard);
      customer.idCardHash = idCardHash;
    }

    Object.assign(customer, {
      name: dto.name ?? customer.name,
      phone: dto.phone ?? customer.phone,
      gender: dto.gender ?? customer.gender,
      birthday: dto.birthday ?? customer.birthday,
      remark: dto.remark ?? customer.remark,
    });

    const saved = await this.repo.save(customer);

    await this.logService.record({
      operatorId: operator?.id ?? 0,
      operator: operator?.username,
      module: 'customer',
      action: 'update',
      targetType: 'customer',
      targetId: id,
      beforeData: before,
      afterData: this.toLogData(saved),
    });

    return saved;
  }

  /** 软删除客户（deleted_at 标记） */
  async remove(id: number, operator?: Operator) {
    const customer = await this.findOne(id);
    await this.repo.softDelete(id);

    await this.logService.record({
      operatorId: operator?.id ?? 0,
      operator: operator?.username,
      module: 'customer',
      action: 'delete',
      targetType: 'customer',
      targetId: id,
      beforeData: this.toLogData(customer),
    });

    return { success: true, id };
  }

  /** 批量导入（占位：逐条创建，忽略单条失败并汇总） */
  async importBatch(dto: ImportCustomerDto, operator?: Operator) {
    const result: {
      total: number;
      success: number;
      failed: number;
      errors: Array<{ name?: string; reason: string }>;
    } = { total: dto.list.length, success: 0, failed: 0, errors: [] };
    for (const item of dto.list) {
      try {
        await this.create(item, operator);
        result.success += 1;
      } catch (e) {
        result.failed += 1;
        result.errors.push({
          name: item.name,
          reason: e instanceof Error ? e.message : '导入失败',
        });
      }
    }
    return result;
  }

  /** 用于操作日志的精简快照（去除加密身份证明文等敏感字段） */
  private toLogData(c: Customer) {
    return {
      id: c.id,
      customerNo: c.customerNo,
      name: c.name,
      phone: c.phone,
      gender: c.gender,
      birthday: c.birthday,
      source: c.source,
      remark: c.remark,
    };
  }
}
