import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 客户主表 customer（被评估对象）
 */
@Entity('customer')
export class Customer {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'customer_no', type: 'varchar', length: 32, unique: true })
  customerNo: string;

  @Column({ name: 'name', type: 'varchar', length: 64 })
  @Index('idx_cust_name')
  name: string;

  @Column({ name: 'id_card', type: 'varchar', length: 32 })
  idCard: string;

  @Column({ name: 'id_card_hash', type: 'varchar', length: 64, unique: true })
  idCardHash: string;

  @Column({ name: 'phone', type: 'varchar', length: 20 })
  @Index('idx_cust_phone')
  phone: string;

  @Column({ name: 'gender', type: 'int', nullable: true })
  gender: number;

  @Column({ name: 'birthday', type: 'varchar', nullable: true })
  birthday: string;

  @Column({ name: 'status', type: 'int', default: 1 })
  status: number;

  @Column({ name: 'source', type: 'varchar', length: 32, default: 'h5' })
  source: string;

  @Column({ name: 'remark', type: 'varchar', length: 255, nullable: true })
  remark: string;

  @Column({ name: 'created_by', type: 'int', nullable: true })
  createdBy: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  @Index('idx_cust_created_at')
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt: Date;
}
