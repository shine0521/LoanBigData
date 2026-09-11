import { IsOptional, IsString } from 'class-validator';
import { PageQueryDto } from '../../../common/dto/page-query.dto';

/** 操作日志查询参数 */
export class LogQueryDto extends PageQueryDto {
  @IsOptional()
  @IsString()
  module?: string;
}
