import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { InventoryModule } from '../inventory/inventory.module';
import { ProductPrice } from './entities/product-price.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { Product } from './entities/product.entity';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
  imports: [TypeOrmModule.forFeature([Product, ProductPrice, InventoryItem]), InventoryModule],
})
export class ProductsModule {}
