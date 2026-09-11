import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateCustomerDto } from './create-customer.dto';

/**
 * 批量导入入参（接收数组）
 * 结构：{ "list": [ {name, idCard, phone, ...}, ... ] }
 */
export class ImportCustomerDto {
  @IsArray({ message: 'list 必须为数组' })
  @ValidateNested({ each: true })
  @Type(() => CreateCustomerDto)
  list: CreateCustomerDto[];
}
