import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from 'src/common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum IncomeExpenseCategory {
  // Income
  SALES_REVENUE = 'sales_revenue',
  RETURN_INCOME = 'return_income',
  OTHER_INCOME = 'other_income',
  // Expense
  PURCHASE = 'purchase',
  SALARIES = 'salaries',
  RENT = 'rent',
  UTILITIES = 'utilities',
  MAINTENANCE = 'maintenance',
  MARKETING = 'marketing',
  TRANSPORT = 'transport',
  TAX = 'tax',
  OTHER_EXPENSE = 'other_expense',
}

@Entity('income_expenses')
export class IncomeExpense extends TenantBaseEntity {
  @ApiProperty({ enum: TransactionType })
  @Column({ type: 'enum', enum: TransactionType, name: 'transaction_type' })
  transactionType: TransactionType;

  @ApiProperty({ enum: IncomeExpenseCategory })
  @Column({ type: 'enum', enum: IncomeExpenseCategory })
  category: IncomeExpenseCategory;

  @ApiProperty()
  @Column({ length: 200 })
  title: string;

  @ApiProperty()
  @Column({ nullable: true, type: 'text' })
  description: string;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @ApiProperty()
  @Column({ name: 'transaction_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  transactionDate: Date;

  @ApiProperty()
  @Column({ nullable: true, name: 'reference_id' })
  referenceId: string;

  @ApiProperty()
  @Column({ nullable: true, name: 'reference_type', length: 50 })
  referenceType: string;

  @ApiProperty()
  @Column({ nullable: true, length: 255 })
  attachment: string;

  @ApiProperty()
  @Column({ name: 'recorded_by', nullable: true })
  recordedBy: string;

  @ApiProperty()
  @Column({ nullable: true, type: 'text' })
  notes: string;
}
