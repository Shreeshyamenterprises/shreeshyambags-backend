import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class CreateProductDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  basePrice?: number; // paise
}