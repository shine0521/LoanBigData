import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';

/**
 * 数据同步日志表 sync_record（H5→后台 数据同步记录）
 * 对应方案文档 3.2 ⑥
 */
@Entity('sync_record')
export class SyncRecord {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'biz_type', type: 'varchar', length: 32 })
  bizType: string;

  @Column({ name: 'biz_id', type: 'int' })
  bizId: number;

  @Column({ name: 'action', type: 'varchar', length: 16 })
  action: string;

  @Column({
    name: 'payload',
    type: 'text',
    nullable: true,
    transformer: {
      to: (value: Record<string, any> | null) => value ? JSON.stringify(value) : null,
      from: (value: string | null) => value ? JSON.parse(value) : null,
    },
  })
  payload: Record<string, any>;

  @Index('idx_sr_sync_status')
  @Column({ name: 'sync_status', type: 'int', default: 0 })
  syncStatus: number;

  @Column({ name: 'retry_count', type: 'int', default: 0 })
  retryCount: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @Column({ name: 'pushed_at', type: 'datetime', nullable: true })
  pushedAt: Date;
}
