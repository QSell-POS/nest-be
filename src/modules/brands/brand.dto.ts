import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateBrandDto {
  @IsString() @IsNotEmpty() name: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() logo?: string;
  @IsOptional() @IsString() website?: string;
}

export class UpdateBrandDto extends CreateBrandDto {}
