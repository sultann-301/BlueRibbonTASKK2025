import { IsDate, IsIn, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateMemberDto {
  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsDate()
  birthdate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  subscription_date?: Date;

  @IsOptional()
  @IsIn(['male', 'female'])
  gender?: string;
}
