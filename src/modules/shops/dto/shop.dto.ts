import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateShopDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() slug: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsString() currencySymbol?: string;
}

export class UpdateShopDto extends CreateShopDto {}
