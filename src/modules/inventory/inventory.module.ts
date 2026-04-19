import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Inventory, InventoryLedger } from "src/entities/inventory.entity";
import { InventoryService } from "./inventory.service";
import { JwtStrategy } from "src/guards/auth.guard";
import { InventoryController } from "./inventory.controller";

@Module({
  controllers: [InventoryController],
  providers: [InventoryService, JwtStrategy],
  imports: [TypeOrmModule.forFeature([Inventory, InventoryLedger])],
})
export class InventoryModule {}
