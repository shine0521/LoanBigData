import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerQueryDto } from './dto/customer-query.dto';
import { ImportCustomerDto } from './dto/import-customer.dto';

/**
 * 客户管理控制器（后台，需登录）
 * 基础路径：/api/admin/customers
 */
@UseGuards(JwtAuthGuard)
@Controller('admin/customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  findAll(@Query() query: CustomerQueryDto) {
    return this.customerService.findAll(query);
  }

  @Post()
  create(
    @Body() dto: CreateCustomerDto,
    @CurrentUser() user: { id: number; username: string },
  ) {
    return this.customerService.create(dto, user);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
    @CurrentUser() user: { id: number; username: string },
  ) {
    return this.customerService.update(Number(id), dto, user);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: number; username: string },
  ) {
    return this.customerService.remove(Number(id), user);
  }

  @Post('import')
  importBatch(
    @Body() dto: ImportCustomerDto,
    @CurrentUser() user: { id: number; username: string },
  ) {
    return this.customerService.importBatch(dto, user);
  }
}
