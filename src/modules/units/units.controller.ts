import { UnitsService } from './units.service';
import { UserRole } from '../users/entities/user.entity';
import { CreateUnitDto, UpdateUnitDto } from './dto/unit.dto';
import { Get, Body, Post, Param, UseGuards, Controller, Delete, Put } from '@nestjs/common';
import { CurrentUser, JwtAuthGuard, Roles, RolesGuard } from 'src/common/guards/auth.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('units')
export class UnitsController {
  constructor(private readonly service: UnitsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  create(@Body() dto: CreateUnitDto, @CurrentUser() user: any) {
    return this.service.create(dto, user.shopId);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.service.findAll(user.shopId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user.shopId);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateUnitDto, @CurrentUser() user: any) {
    return this.service.update(id, dto, user.shopId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user.shopId);
  }
}
