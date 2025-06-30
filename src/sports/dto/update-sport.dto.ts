import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateSportDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  subscription_price?: number;

  @IsOptional()
  @IsIn(['male', 'female'])
  allowed_gender?: string;
}
