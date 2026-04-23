import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../entities/sale.entity';

export class CreateSaleItemDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @Min(0.01)
  quantity: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountRate?: number;
}

export class CreateSaleDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  paidAmount?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];
}

export class UpdateSaleDto extends CreateSaleDto {}

export class CreateSaleReturnDto {
  @IsUUID()
  saleId: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  refundMethod?: string;

  @IsArray()
  items: { productId: string; quantity: number; unitPrice: number; reason?: string }[];

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountRate?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateCustomerDto extends CreateCustomerDto {}

export class SaleFilterDto {
  @IsOptional()
  search?: string;

  @IsOptional()
  customerId?: string;

  @IsOptional()
  status?: string;

  @IsOptional()
  paymentStatus?: string;

  @IsOptional()
  startDate?: string;

  @IsOptional()
  endDate?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}

export class RecordPaymentDto {
  @IsNumber()
  @Min(0.01)
  amount: number;
}
