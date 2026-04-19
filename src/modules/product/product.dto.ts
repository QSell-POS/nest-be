import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from "class-validator";

export class ProductDto {
  @IsUUID()
  shopId: string;

  @IsUUID()
  brandId: string;

  @IsUUID()
  categoryId: string;

  @IsUUID()
  baseUnitId: string;

  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsOptional()
  @MaxLength(255)
  description: string;

  @IsNotEmpty()
  sku: string;

  @IsOptional()
  @IsString()
  barcode: string;

  @IsNumber()
  sellingPrice: number;

  @IsNumber()
  stockThreshold: number;

  @IsOptional()
  isActive: boolean;

  @IsNumber()
  quantity: number;

  @IsNumber()
  costPrice: number;
}
