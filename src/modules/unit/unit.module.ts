import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtStrategy } from "src/guards/auth.guard";
import { UnitService } from "./unit.service";
import { UnitController } from "./unit.controller";
import { Unit } from "src/entities/unit.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Unit])],
  providers: [UnitService, JwtStrategy],
  controllers: [UnitController],
})
export class UnitModule {}
