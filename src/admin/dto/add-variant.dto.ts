import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class PricingTierDto {
  @IsInt()
  minQtyKg: number;

  @IsInt()
  pricePerKg: number;
}

export class AddVariantDto {
  @IsString()
  size: string;

  @IsString()
  color: string;

  @IsString()
  shape: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsInt()
  stock?: number;

  @IsOptional()
  @IsInt()
  price?: number;

  @IsOptional()
  @IsInt()
  gsm?: number;

  @IsOptional()
  @IsInt()
  pricePerKg?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PricingTierDto)
  pricingTiers?: PricingTierDto[];
}
