import { IsString, IsIn, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMemberDto {
  @IsString()
  first_name: string;
  @IsString()
  last_name: string;
  @IsDate()
  @Type(() => Date)
  subscription_date: Date;
  @IsDate()
  @Type(() => Date)
  birthdate: Date;
  @IsIn(['male', 'female'])
  gender: string;
}
