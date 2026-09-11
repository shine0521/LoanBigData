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
 * 后台管理员表 admin_user
 * 对应方案文档 3.2 ①
 */
@Entity('admin_user')
export class AdminUser {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'username', type: 'varchar', length: 64 })
  username: string;

  @Column({ name: 'password', type: 'varchar', length: 128 })
  password: string;

  @Column({ name: 'real_name', type: 'varchar', length: 64, nullable: true })
  realName: string;

  @Column({ name: 'phone', type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ name: 'email', type: 'varchar', length: 128, nullable: true })
  email: string;

  @Column({ name: 'role', type: 'varchar', length: 32, default: 'operator' })
  role: string;

  @Index('idx_au_status')
  @Column({ name: 'status', type: 'int', default: 1 })
  status: number;

  @Column({ name: 'last_login_at', type: 'datetime', nullable: true })
  lastLoginAt: Date;

  @Column({ name: 'last_login_ip', type: 'varchar', length: 64, nullable: true })
  lastLoginIp: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt: Date;
}
