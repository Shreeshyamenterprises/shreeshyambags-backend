import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class AddVariantDto {
  @IsString()
  size!: string;

  @IsString()
  color!: string;

  @IsString()
  shape!: string;

  @IsInt()
  @Min(0)
  price!: number; // paise

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number = 0;

  @IsOptional()
  @IsString()
  sku?: string;
}