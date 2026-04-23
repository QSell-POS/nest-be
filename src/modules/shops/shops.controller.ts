import { Get, Body, Post, Param, UseGuards, Controller, Put, BadRequestException } from '@nestjs/common';
import { CurrentUser, JwtAuthGuard, Roles, RolesGuard } from 'src/common/guards/auth.guard';
import { UserRole } from '../users/entities/user.entity';
import { CreateShopDto, UpdateShopDto } from './dto/shop.dto';
import { ShopsService } from './shops.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  create(@Body() dto: CreateShopDto, @CurrentUser() user: any) {
    return this.shopsService.create(dto, user.id);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  findAll() {
    return this.shopsService.findAll();
  }

  @Get('mine')
  getMyShop(@CurrentUser() user: any) {
    if (!user.shopId) {
      throw new BadRequestException("You don't have a shop yet");
    }
    return this.shopsService.getMyShop(user.shopId);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN)
  findOne(@Param('id') id: string) {
    return this.shopsService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateShopDto) {
    return this.shopsService.update(id, dto);
  }
}
