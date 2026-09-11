import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 评分明细表 score_detail（综合 + 单银行）
 */
@Entity('score_detail')
export class ScoreDetail {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'assessment_id', type: 'int' })
  @Index('idx_sd_score_type')
  assessmentId: number;

  @Column({ name: 'score_type', type: 'varchar', length: 16 })
  scoreType: string;

  @Column({ name: 'score', type: 'int' })
  score: number;

  @Column({ name: 'risk_level', type: 'int' })
  riskLevel: number;

  @Column({ name: 'trend', type: 'varchar', length: 8, nullable: true })
  trend: string;

  @Column({
    name: 'dimensions',
    type: 'text',
    nullable: true,
    transformer: {
      to: (value: Record<string, any> | null) => value ? JSON.stringify(value) : null,
      from: (value: string | null) => value ? JSON.parse(value) : null,
    },
  })
  dimensions: Record<string, any>;

  @Column({ name: 'is_manual', type: 'int', default: 0 })
  isManual: number;

  @Column({ name: 'manual_reason', type: 'varchar', length: 255, nullable: true })
  manualReason: string;

  @Column({ name: 'operator_id', type: 'int', nullable: true })
  operatorId: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}
