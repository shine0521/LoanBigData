import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { PageQueryDto } from '../../../common/dto/page-query.dto';

/** 资料记录查询参数（分页 + 筛选 name/phone/时间范围） */
export class ProfileQueryDto extends PageQueryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  /** 起始时间 YYYY-MM-DD */
  @IsOptional()
  @IsString()
  startDate?: string;

  /** 结束时间 YYYY-MM-DD */
  @IsOptional()
  @IsString()
  endDate?: string;

  /** 提交来源 h5/admin/import */
  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  isCurrent?: number; // 1当前 0历史
}
