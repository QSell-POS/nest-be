import { Module } from "@nestjs/common";
import { ProductService } from "./product.service";
import { ProductController } from "./product.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "src/entities/product.entity";
import { JwtStrategy } from "src/guards/auth.guard";
import { Shop } from "src/entities/shop.entity";

@Module({
  controllers: [ProductController],
  providers: [ProductService, JwtStrategy],
  imports: [TypeOrmModule.forFeature([Product, Shop])],
})
export class ProductModule {}
