import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

export class CreatePurchaseItemDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @Min(0.01)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitCost: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountRate?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreatePurchaseDto {
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @IsOptional()
  @IsString()
  expectedDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  attachment?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseItemDto)
  items: CreatePurchaseItemDto[];
}

export class UpdatePurchaseDto extends CreatePurchaseDto {}

export class ReceivePurchaseDto {
  @IsArray()
  receivedItems: { purchaseItemId: string; receivedQuantity: number }[];

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreatePurchaseReturnDto {
  @IsUUID()
  purchaseId: string;

  @IsArray()
  items: { productId: string; quantity: number; unitCost: number; reason?: string }[];

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateSupplierDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  contactPerson?: string;

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
  @IsString()
  taxNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateSupplierDto extends CreateSupplierDto {}

export class RecordPaymentDto {
  @IsNumber()
  @Min(0.01)
  amount: number;
}
