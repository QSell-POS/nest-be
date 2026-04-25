import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IncomeExpenseService } from './income-expense.service';
import {
  CreateIncomeExpenseDto,
  UpdateIncomeExpenseDto,
  IncomeExpenseFilterDto,
} from './dto/income-expense.dto';
import {
  JwtAuthGuard,
  CurrentUser,
  Roles,
  RolesGuard,
} from '../../common/guards/auth.guard';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Income & Expense')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('income-expense')
export class IncomeExpenseController {
  constructor(private readonly service: IncomeExpenseService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Record income or expense manually' })
  create(@Body() dto: CreateIncomeExpenseDto, @CurrentUser() user: any) {
    return this.service.create(dto, user.shopId, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List income/expense with filters and summary' })
  findAll(@Query() filters: IncomeExpenseFilterDto, @CurrentUser() user: any) {
    return this.service.findAll(filters, user.shopId);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get income/expense summary by date range' })
  getSummary(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @CurrentUser() user: any,
  ) {
    return this.service.getSummaryByPeriod(user.shopId, startDate, endDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get record by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user.shopId);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update record' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateIncomeExpenseDto,
    @CurrentUser() user: any,
  ) {
    return this.service.update(id, dto, user.shopId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete record' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user.shopId);
  }
}
