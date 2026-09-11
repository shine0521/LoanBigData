import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { PageQueryDto } from '../../../common/dto/page-query.dto';

/** 评估记录列表查询参数（分页 + 筛选） */
export class AssessmentQueryDto extends PageQueryDto {
  @IsOptional()
  @IsString()
  name?: string; // 客户姓名（模糊）

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  riskLevel?: number; // 1低 2中 3高

  @IsOptional()
  @IsString()
  startDate?: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  endDate?: string; // YYYY-MM-DD
}
