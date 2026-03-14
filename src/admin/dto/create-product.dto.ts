import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  title!: string;

  @IsString()
  slug!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  basePrice?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
