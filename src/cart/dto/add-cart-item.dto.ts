import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class AddCartItemDto {
  @IsString()
  variantId!: string;

  @IsOptional()
  @IsString()
  customText?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number = 1;
}