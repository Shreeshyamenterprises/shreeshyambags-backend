import { IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  shipName!: string;

  @IsString()
  shipPhone!: string;

  @IsString()
  shipAddressLine1!: string;

  @IsOptional()
  @IsString()
  shipAddressLine2?: string;

  @IsString()
  shipCity!: string;

  @IsString()
  shipState!: string;

  @IsString()
  shipPincode!: string;
}
