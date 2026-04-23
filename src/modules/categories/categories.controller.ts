import { CategoriesService } from './categories.service';
import { UserRole } from '../users/entities/user.entity';
import { CurrentUser, JwtAuthGuard, Roles, RolesGuard } from 'src/common/guards/auth.guard';
import { Get, Body, Post, Param, Patch, UseGuards, Controller, Delete, Query, Put } from '@nestjs/common';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { UuidParamPipe } from 'src/common/validator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoryService: CategoriesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  create(@Body() dto: CreateCategoryDto, @CurrentUser() user: any) {
    return this.categoryService.create(dto, user.shopId);
  }

  @Get('tree')
  getTree(@CurrentUser() user: any) {
    return this.categoryService.findAll(user.shopId);
  }

  @Get()
  getFlat(@Query('search') search: string, @CurrentUser() user: any) {
    return this.categoryService.findFlat(user.shopId, search);
  }

  @Get(':id')
  findOne(@Param('id', UuidParamPipe) id: string, @CurrentUser() user: any) {
    return this.categoryService.findOne(id, user.shopId);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  update(@Param('id', UuidParamPipe) id: string, @Body() dto: UpdateCategoryDto, @CurrentUser() user: any) {
    return this.categoryService.update(id, dto, user.shopId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  remove(@Param('id', UuidParamPipe) id: string, @CurrentUser() user: any) {
    return this.categoryService.remove(id, user.shopId);
  }
}
