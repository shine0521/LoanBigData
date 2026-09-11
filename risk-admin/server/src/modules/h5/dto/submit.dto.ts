import { IsNotEmpty, IsString } from 'class-validator';

/** H5 提交入参 */
export class H5SubmitDto {
  @IsString({ message: '姓名必须为字符串' })
  @IsNotEmpty({ message: '姓名不能为空' })
  name: string;

  @IsString({ message: '身份证号必须为字符串' })
  @IsNotEmpty({ message: '身份证号不能为空' })
  idCard: string;

  @IsString({ message: '手机号必须为字符串' })
  @IsNotEmpty({ message: '手机号不能为空' })
  phone: string;
}
