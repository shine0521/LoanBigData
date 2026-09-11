import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/** 新增客户入参 */
export class CreateCustomerDto {
  @IsString({ message: '姓名必须为字符串' })
  @IsNotEmpty({ message: '姓名不能为空' })
  name: string;

  @IsString({ message: '身份证号必须为字符串' })
  @IsNotEmpty({ message: '身份证号不能为空' })
  idCard: string;

  @IsString({ message: '手机号必须为字符串' })
  @IsNotEmpty({ message: '手机号不能为空' })
  phone: string;

  @IsOptional()
  @IsInt({ message: '性别必须为整数' })
  gender?: number; // 1男 2女 0未知

  @IsOptional()
  @IsDateString({}, { message: '出生日期格式不正确' })
  birthday?: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  remark?: string;

  /** 来源: h5/admin/import，后台新增默认 admin */
  @IsOptional()
  @IsString()
  source?: string;
}
