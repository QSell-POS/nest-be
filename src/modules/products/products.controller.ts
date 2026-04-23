import { ProductsService } from './products.service';

import { UserRole } from '../users/entities/user.entity';
import { CurrentUser, JwtAuthGuard, Roles, RolesGuard } from 'src/common/guards/auth.guard';
import { Get, Post, Body, Param, Delete, UseGuards, Controller, Query, Put, Patch } from '@nestjs/common';
import { CreateProductDto, ProductFilterDto, UpdateProductDto, UpdateProductPriceDto } from './dto/product.dto';
import { UuidParamPipe } from 'src/common/validator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query() filters: ProductFilterDto, @CurrentUser() user: any) {
    return this.productsService.findAll(filters, user.shopId);
  }

  @Get(':id')
  findOne(@Param('id', UuidParamPipe) id: string, @CurrentUser() user: any) {
    return this.productsService.findOne(id, user.shopId);
  }

  @Get('barcode/:barcode')
  findByBarcode(@Param('barcode') barcode: string, @CurrentUser() user: any) {
    return this.productsService.findByBarcode(barcode, user.shopId);
  }

  @Get(':id/price-history')
  getPriceHistory(@Param('id', UuidParamPipe) id: string, @CurrentUser() user: any) {
    return this.productsService.getPriceHistory(id, user.shopId);
  }

  @Post('')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  create(@Body() dto: CreateProductDto, @CurrentUser() user: any) {
    return this.productsService.create(dto, user.shopId, user.id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  update(@Param('id', UuidParamPipe) id: string, @Body() dto: UpdateProductDto, @CurrentUser() user: any) {
    return this.productsService.update(id, dto, user.shopId);
  }

  @Patch(':id/price')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  updatePrice(@Param('id', UuidParamPipe) id: string, @Body() dto: UpdateProductPriceDto, @CurrentUser() user: any) {
    return this.productsService.updatePrice(id, dto, user.shopId, user.id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  remove(@Param('id', UuidParamPipe) id: string, @CurrentUser() user: any) {
    return this.productsService.remove(id, user.shopId);
  }
}
