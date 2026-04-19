import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  MinLength,
} from "class-validator";

export class UnitDto {
  @IsNotEmpty()
  @MinLength(1)
  code: string;

  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsNotEmpty()
  @IsNumber()
  baseMultiplier: number;

  @IsNotEmpty()
  @IsUUID()
  shopId: string;
}

export class UpdateUnitDto {
  @IsOptional()
  @MinLength(1)
  code: string;

  @IsOptional()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsNumber()
  baseMultiplier: number;
}
