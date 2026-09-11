import { IsOptional, IsString } from 'class-validator';

/**
 * 查询评分入参
 * 方式一：assessmentNo（评估单号）
 * 方式二：name + idCard + phone
 */
export class QueryScoreDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  idCard?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  assessmentNo?: string;
}
