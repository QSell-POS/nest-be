import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class PurchaseItemDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  costPrice: number;

  @IsOptional()
  @IsNumber()
  total?: number;
}

export class PurchaseDto {
  @IsUUID()
  @IsNotEmpty()
  shopId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseItemDto)
  items: PurchaseItemDto[];

  @IsOptional()
  @IsString()
  supplierName?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
