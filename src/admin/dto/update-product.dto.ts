import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
