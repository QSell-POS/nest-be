import { Module } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchasesController } from './purchases.controller';
import { PurchaseReturn, PurchaseReturnItem } from './entities/purchase-return.entity';
import { Supplier } from './entities/supplier.entity';
import { InventoryModule } from '../inventory/inventory.module';
import { ProductsModule } from '../products/products.module';
import { PurchaseItem } from './entities/purchase-item.entity';
import { Purchase } from './entities/purchase.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Purchase, PurchaseItem, PurchaseReturn, PurchaseReturnItem, Supplier]),
    InventoryModule,
    ProductsModule,
    // IncomeExpenseModule,
  ],
  providers: [PurchasesService],
  controllers: [PurchasesController],
})
export class PurchasesModule {}
