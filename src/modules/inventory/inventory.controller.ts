import { InventoryService } from './inventory.service';
import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser, JwtAuthGuard, Roles, RolesGuard } from 'src/common/guards/auth.guard';
import { UserRole } from '../users/entities/user.entity';
import { AdjustStockDto } from './dto/inventory.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  getInventory(@Query('page') page: number, @Query('limit') limit: number, @CurrentUser() user: any) {
    return this.inventoryService.getInventory(user.shopId, page, limit);
  }

  @Get('low-stock')
  getLowStock(@CurrentUser() user: any) {
    return this.inventoryService.getLowStockProducts(user.shopId);
  }

  @Get('history')
  getHistory(@Query() filters: any, @CurrentUser() user: any) {
    return this.inventoryService.getHistory(user.shopId, filters);
  }

  @Get('product/:productId')
  getByProduct(@Param('productId') productId: string, @CurrentUser() user: any) {
    return this.inventoryService.getInventoryByProduct(productId, user.shopId);
  }

  @Post('adjust')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  adjustStock(@Body() dto: AdjustStockDto, @CurrentUser() user: any) {
    return this.inventoryService.adjustStock({ ...dto, performedBy: user.id }, user.shopId);
  }
}
