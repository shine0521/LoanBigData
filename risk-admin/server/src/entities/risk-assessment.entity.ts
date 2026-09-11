import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 风险评估记录表 risk_assessment
 */
@Entity('risk_assessment')
export class RiskAssessment {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'assessment_no', type: 'varchar', length: 32, unique: true })
  assessmentNo: string;

  @Column({ name: 'customer_id', type: 'int' })
  @Index('idx_ra_customer_id')
  customerId: number;

  @Column({ name: 'profile_id', type: 'int' })
  profileId: number;

  @Column({ name: 'comprehensive_score', type: 'int', nullable: true })
  comprehensiveScore: number;

  @Column({ name: 'risk_level', type: 'int', nullable: true })
  riskLevel: number;

  @Column({ name: 'status', type: 'int', default: 0 })
  @Index('idx_ra_status')
  status: number;

  @Column({ name: 'calc_source', type: 'varchar', length: 32, default: 'auto' })
  calcSource: string;

  @Column({ name: 'fail_reason', type: 'varchar', length: 255, nullable: true })
  failReason: string;

  @Column({ name: 'assessed_at', type: 'datetime', nullable: true })
  assessedAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  @Index('idx_ra_created_at')
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}
