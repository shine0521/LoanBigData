import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/** 编辑客户入参（所有字段可选） */
export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: '姓名不能为空' })
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: '身份证号不能为空' })
  idCard?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: '手机号不能为空' })
  phone?: string;

  @IsOptional()
  @IsInt({ message: '性别必须为整数' })
  gender?: number;

  @IsOptional()
  @IsDateString({}, { message: '出生日期格式不正确' })
  birthday?: string;

  @IsOptional()
  @IsString()
  remark?: string;
}
