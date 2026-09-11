import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';

/**
 * 操作日志表 operation_log
 */
@Entity('operation_log')
export class OperationLog {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'operator_id', type: 'int' })
  @Index('idx_ol_operator')
  operatorId: number;

  @Column({ name: 'operator', type: 'varchar', length: 64, nullable: true })
  operator: string;

  @Column({ name: 'module', type: 'varchar', length: 64 })
  @Index('idx_ol_module')
  module: string;

  @Column({ name: 'action', type: 'varchar', length: 64 })
  action: string;

  @Column({ name: 'target_type', type: 'varchar', length: 32, nullable: true })
  targetType: string;

  @Column({ name: 'target_id', type: 'int', nullable: true })
  targetId: number;

  @Column({
    name: 'before_data',
    type: 'text',
    nullable: true,
    transformer: {
      to: (value: Record<string, any> | null) => value ? JSON.stringify(value) : null,
      from: (value: string | null) => value ? JSON.parse(value) : null,
    },
  })
  beforeData: Record<string, any>;

  @Column({
    name: 'after_data',
    type: 'text',
    nullable: true,
    transformer: {
      to: (value: Record<string, any> | null) => value ? JSON.stringify(value) : null,
      from: (value: string | null) => value ? JSON.parse(value) : null,
    },
  })
  afterData: Record<string, any>;

  @Column({ name: 'ip', type: 'varchar', length: 64, nullable: true })
  ip: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  @Index('idx_ol_created_at')
  createdAt: Date;
}
