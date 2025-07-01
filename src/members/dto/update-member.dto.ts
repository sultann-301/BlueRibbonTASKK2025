import {
  IsDate,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
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
  @Type(() => Date)
  birthdate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  subscription_date?: Date;

  @IsOptional()
  @IsIn(['male', 'female'])
  gender?: string;

  @IsOptional()
  @IsNumber()
  central_member_id?: number;
}
