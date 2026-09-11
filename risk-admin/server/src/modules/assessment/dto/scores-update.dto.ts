import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * 人工修正评分入参（PUT /api/admin/scores/:id）
 * :id 为 score_detail 主键
 */
export class ScoresUpdateDto {
  @IsInt({ message: '分数必须为整数' })
  @IsNotEmpty({ message: '分数不能为空' })
  score: number; // 0-1000

  /** 不传则根据分数自动映射风险等级 */
  @IsOptional()
  @IsInt()
  riskLevel?: number;

  @IsString({ message: '修正原因必须为字符串' })
  @IsNotEmpty({ message: '修正原因不能为空' })
  manualReason: string;

  @IsOptional()
  @IsInt()
  operatorId?: number;
}
