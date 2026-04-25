import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncomeExpense } from './entities/income-expense.entity';
import { IncomeExpenseService } from './income-expense.service';
import { IncomeExpenseController } from './income-expense.controller';

@Module({
  imports: [TypeOrmModule.forFeature([IncomeExpense])],
  controllers: [IncomeExpenseController],
  providers: [IncomeExpenseService],
  exports: [IncomeExpenseService],
})
export class IncomeExpenseModule {}
