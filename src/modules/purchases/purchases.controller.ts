import {
  CreatePurchaseDto,
  CreatePurchaseReturnDto,
  CreateSupplierDto,
  ReceivePurchaseDto,
  RecordPaymentDto,
  UpdateSupplierDto,
} from './dto/purchase.dto';
import { PurchasesService } from './purchases.service';
import { CurrentUser, JwtAuthGuard, Roles, RolesGuard } from 'src/common/guards/auth.guard';
import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '../users/entities/user.entity';
import { UuidParamPipe } from 'src/common/validator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  // ── Suppliers ───────────────────────────────────────────── //
  @Post('suppliers')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  createSupplier(@Body() dto: CreateSupplierDto, @CurrentUser() user: any) {
    return this.purchasesService.createSupplier(dto, user.shopId);
  }

  @Get('suppliers')
  getSuppliers(@Query('search') search: string, @CurrentUser() user: any) {
    return this.purchasesService.getSuppliers(user.shopId, search);
  }

  @Put('suppliers/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  updateSupplier(@Param('id', UuidParamPipe) id: string, @Body() dto: UpdateSupplierDto, @CurrentUser() user: any) {
    return this.purchasesService.updateSupplier(id, dto, user.shopId);
  }

  // ── Purchases ─────────────────────────────────────────────
  @Get()
  findAll(@Query() filters: any, @CurrentUser() user: any) {
    return this.purchasesService.findAll(user.shopId, filters);
  }

  @Get(':id')
  findOne(@Param('id', UuidParamPipe) id: string, @CurrentUser() user: any) {
    return this.purchasesService.findOne(id, user.shopId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  create(@Body() dto: CreatePurchaseDto, @CurrentUser() user: any) {
    return this.purchasesService.create(dto, user.shopId, user.id);
  }

  @Post(':id/receive')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  receive(@Param('id', UuidParamPipe) id: string, @Body() dto: ReceivePurchaseDto, @CurrentUser() user: any) {
    return this.purchasesService.receivePurchase(id, dto, user.shopId, user.id);
  }

  @Post(':id/payment')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  recordPayment(@Param('id', UuidParamPipe) id: string, @Body() dto: RecordPaymentDto, @CurrentUser() user: any) {
    return this.purchasesService.recordPayment(id, dto.amount, user.shopId);
  }

  // ── Purchase Returns ───────────────────────────────────────
  @Get('returns/all')
  getReturns(@Query('page') page: number, @Query('limit') limit: number, @CurrentUser() user: any) {
    return this.purchasesService.getReturns(user.shopId, page, limit);
  }

  @Post('returns')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  createReturn(@Body() dto: CreatePurchaseReturnDto, @CurrentUser() user: any) {
    return this.purchasesService.createReturn(dto, user.shopId, user.id);
  }
}
