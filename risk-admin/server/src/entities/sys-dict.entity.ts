import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 数据字典表 sys_dict（可选）
 * 对应方案文档 3.2 ⑧
 */
@Index('uk_type_key', ['dictType', 'dictKey'])
@Entity('sys_dict')
export class SysDict {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'dict_type', type: 'varchar', length: 64 })
  dictType: string;

  @Column({ name: 'dict_key', type: 'varchar', length: 64 })
  dictKey: string;

  @Column({ name: 'dict_value', type: 'varchar', length: 255 })
  dictValue: string;

  @Column({ name: 'sort', type: 'int', default: 0 })
  sort: number;

  @Column({ name: 'status', type: 'int', default: 1 })
  status: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}
