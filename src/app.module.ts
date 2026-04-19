import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { AuthModule } from "./modules/auth/auth.module";
import { ShopModule } from "./modules/shop/shop.module";
import { ProductModule } from "./modules/product/product.module";
import { PurchaseModule } from "./modules/purchase/purchase.module";
import { CategoryModule } from "./modules/category/category.module";
import { BrandModule } from "./modules/brand/brand.module";
import { UnitModule } from "./modules/unit/unit.module";
import { InventoryModule } from "./modules/inventory/inventory.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: "postgres",
          host: "localhost",
          port: 5432,
          username: "pos",
          password: "pos",
          database: "posdb",
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
    AuthModule,
    ShopModule,
    BrandModule,
    ProductModule,
    CategoryModule,
    UnitModule,
    PurchaseModule,
    InventoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
