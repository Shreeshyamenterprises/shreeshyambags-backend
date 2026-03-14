import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateQuoteDto {
  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  variantId?: string;

  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsInt()
  quantityKg: number;

  @IsOptional()
  @IsInt()
  gsm?: number;

  @IsOptional()
  @IsBoolean()
  printing?: boolean;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  message?: string;
}
