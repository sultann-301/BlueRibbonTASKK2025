import { IsString, IsIn, IsDate, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMemberDto {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  subscription_date?: Date;

  @IsDate()
  @Type(() => Date)
  birthdate: Date;

  @IsIn(['male', 'female'])
  gender: string;

  @IsOptional()
  @IsInt()
  central_member_id?: number;
}
