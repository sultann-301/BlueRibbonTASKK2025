import { Type, Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, IsIn } from 'class-validator';

export class SubscribeMemberDto {
  @IsNotEmpty({ message: 'member_id is required' })
  @IsNumber({}, { message: 'member_id must be a number' })
  @Type(() => Number)
  @Transform(({ value }) => {
    console.log('Transforming member_id:', value, 'type:', typeof value);
    if (value === null || value === undefined || value === 'null') {
      throw new Error('member_id cannot be null or undefined');
    }
    return parseInt(value, 10);
  })
  member_id: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  sport_id: number;

  @IsString()
  @IsIn(['group', 'private'])
  type: 'group' | 'private';
}
