import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { InventoryMovementType } from '../entities/inventory-history.entity';

export class AdjustStockDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @Min(0.01)
  quantity: number;

  @IsEnum(InventoryMovementType)
  movementType: InventoryMovementType;

  @IsOptional()
  @IsNumber()
  unitCost?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export interface StockAdjustmentDto {
  productId: string;
  quantity: number;
  movementType: InventoryMovementType;
  notes?: string;
  referenceId?: string;
  referenceType?: string;
  unitCost?: number;
  performedBy?: string;
}
