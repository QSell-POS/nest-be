import { Module } from "@nestjs/common";
import { PurchaseService } from "./purchase.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Purchase } from "src/entities/purchase.entity";
import { JwtStrategy } from "src/guards/auth.guard";
import { PurchaseController } from "./purchase.controller";
import { PurchaseItem } from "src/entities/purchase-item.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Purchase, PurchaseItem])],
  providers: [PurchaseService, JwtStrategy],
  controllers: [PurchaseController],
})
export class PurchaseModule {}
