import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { PageQueryDto } from '../../../common/dto/page-query.dto';

/** 客户列表查询参数（分页 + 搜索 name/phone/riskLevel） */
export class CustomerQueryDto extends PageQueryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  /** 风险等级 1低 2中 3高（按最新评估关联过滤） */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  riskLevel?: number;
}
