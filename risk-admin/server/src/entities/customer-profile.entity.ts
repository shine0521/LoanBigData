import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 客户资料表 customer_profile（H5 填写信息落地）
 * 对应方案文档 3.2 ③
 */
@Entity('customer_profile')
export class CustomerProfile {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Index('idx_cp_customer_id')
  @Column({ name: 'customer_id', type: 'int' })
  customerId: number;

  @Column({ name: 'name', type: 'varchar', length: 64 })
  name: string;

  @Column({ name: 'id_card', type: 'varchar', length: 32 })
  idCard: string;

  @Column({ name: 'phone', type: 'varchar', length: 20 })
  phone: string;

  @Column({
    name: 'ext_info',
    type: 'text',
    nullable: true,
    transformer: {
      to: (value: Record<string, any> | null) => value ? JSON.stringify(value) : null,
      from: (value: string | null) => value ? JSON.parse(value) : null,
    },
  })
  extInfo: Record<string, any>;

  @Column({ name: 'submit_source', type: 'varchar', length: 32, default: 'h5' })
  submitSource: string;

  @Column({ name: 'submit_ip', type: 'varchar', length: 64, nullable: true })
  submitIp: string | null;

  @Column({ name: 'user_agent', type: 'varchar', length: 512, nullable: true })
  userAgent: string | null;

  @Column({ name: 'version', type: 'int', default: 1 })
  version: number;

  @Index('idx_cp_is_current')
  @Column({ name: 'is_current', type: 'int', default: 1 })
  isCurrent: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  @Index('idx_cp_created_at')
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}
