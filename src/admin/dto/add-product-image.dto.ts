import { IsOptional, IsString } from 'class-validator';

export class AddProductImageDto {
  @IsOptional()
  @IsString()
  alt?: string;
}
