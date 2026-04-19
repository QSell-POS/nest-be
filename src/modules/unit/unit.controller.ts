import {
  Get,
  Body,
  Post,
  Param,
  Patch,
  UseGuards,
  Controller,
  Delete,
  Req,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { UnitService } from "./unit.service";
import { UuidParamPipe } from "src/common/validator";
import { UnitDto, UpdateUnitDto } from "./unit.dto";

@Controller("unit")
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Get()
  @UseGuards(AuthGuard("jwt"))
  fetch(@Req() req) {
    return this.unitService.fetch({ shop: { id: req.user.shopId } });
  }

  @Get(":id")
  @UseGuards(AuthGuard("jwt"))
  fetchOne(@Param("id", UuidParamPipe) id: string) {
    return this.unitService.fetchOne(id);
  }

  @Post()
  @UseGuards(AuthGuard("jwt"))
  create(@Body() data: UnitDto) {
    return this.unitService.create(data);
  }

  @Patch(":id")
  @UseGuards(AuthGuard("jwt"))
  async update(
    @Param("id", UuidParamPipe) id: string,
    @Body() body: UpdateUnitDto,
  ) {
    return this.unitService.update(id, body);
  }

  @Delete(":id")
  @UseGuards(AuthGuard("jwt"))
  async delete(@Param("id", UuidParamPipe) id: string) {
    return this.unitService.delete(id);
  }
}
