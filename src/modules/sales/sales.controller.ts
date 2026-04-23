import { SalesService } from './sales.service';
import { UserRole } from '../users/entities/user.entity';
import { JwtAuthGuard, CurrentUser, Roles, RolesGuard } from 'src/common/guards/auth.guard';
import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { CreateSaleDto, CreateSaleReturnDto, CreateCustomerDto, UpdateCustomerDto, SaleFilterDto, RecordPaymentDto } from './dto/sale.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  // ── Customers ─────────────────────────────────────────────
  @Post('customers')
  createCustomer(@Body() dto: CreateCustomerDto, @CurrentUser() user: any) {
    return this.salesService.createCustomer(dto, user.shopId);
  }

  @Get('customers')
  getCustomers(@Query('search') search: string, @Query('page') page: number, @Query('limit') limit: number, @CurrentUser() user: any) {
    return this.salesService.getCustomers(user.shopId, search, page, limit);
  }

  @Get('customers/:id')
  getCustomer(@Param('id') id: string, @CurrentUser() user: any) {
    return this.salesService.getCustomer(id, user.shopId);
  }

  @Put('customers/:id')
  updateCustomer(@Param('id') id: string, @Body() dto: UpdateCustomerDto, @CurrentUser() user: any) {
    return this.salesService.updateCustomer(id, dto, user.shopId);
  }

  // ── Sales ──────────────────────────────────────────────────
  @Post()
  create(@Body() dto: CreateSaleDto, @CurrentUser() user: any) {
    return this.salesService.create(dto, user.shopId, user.id);
  }

  @Get()
  findAll(@Query() filters: SaleFilterDto, @CurrentUser() user: any) {
    return this.salesService.findAll(filters, user.shopId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.salesService.findOne(id, user.shopId);
  }

  @Post(':id/payment')
  @HttpCode(HttpStatus.OK)
  recordPayment(@Param('id') id: string, @Body() dto: RecordPaymentDto, @CurrentUser() user: any) {
    return this.salesService.recordPayment(id, dto.amount, user.shopId);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  cancelSale(@Param('id') id: string, @CurrentUser() user: any) {
    return this.salesService.cancelSale(id, user.shopId, user.id);
  }

  // ── Sale Returns ───────────────────────────────────────────
  @Post('returns')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  createReturn(@Body() dto: CreateSaleReturnDto, @CurrentUser() user: any) {
    return this.salesService.createReturn(dto, user.shopId, user.id);
  }

  @Get('returns/all')
  getReturns(@Query('page') page: number, @Query('limit') limit: number, @CurrentUser() user: any) {
    return this.salesService.getReturns(user.shopId, page, limit);
  }
}
