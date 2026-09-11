import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * 业务异常：携带自定义 code，便于统一响应包装
 * 例：throw new ApiException(1002, '未查询到该用户的风险评分信息', 404)
 */
export class ApiException extends HttpException {
  constructor(
    code: number,
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super({ code, message }, status);
  }
}
