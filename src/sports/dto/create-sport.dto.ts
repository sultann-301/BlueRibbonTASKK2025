import { IsString, IsNumber, IsIn } from 'class-validator';

export class CreateSportDto {
  @IsString()
  name: string;

  @IsNumber()
  subscription_price: number;

  @IsIn(['male', 'female'])
  allowed_gender: string;
}
