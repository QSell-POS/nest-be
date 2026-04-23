import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUnitDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() symbol: string;
  @IsOptional() @IsString() description?: string;
}
export class UpdateUnitDto extends CreateUnitDto {}
