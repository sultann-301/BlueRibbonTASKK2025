import { IsNumber, IsNotEmpty } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class UnsubscribeMemberDto {
  @IsNotEmpty({ message: 'member_id is required' })
  @IsNumber({}, { message: 'member_id must be a number' })
  @Type(() => Number)
  @Transform(({ value }) => {
    console.log(
      'Transforming member_id for unsubscribe:',
      value,
      'type:',
      typeof value,
    );
    if (
      value === null ||
      value === undefined ||
      value === 'null' ||
      value === 'undefined'
    ) {
      throw new Error(
        'member_id cannot be null, undefined, or string representations of these',
      );
    }
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      throw new Error('member_id must be a valid number');
    }
    return parsed;
  })
  member_id: number;

  @IsNotEmpty({ message: 'sport_id is required' })
  @IsNumber({}, { message: 'sport_id must be a number' })
  @Type(() => Number)
  @Transform(({ value }) => {
    console.log(
      'Transforming sport_id for unsubscribe:',
      value,
      'type:',
      typeof value,
    );
    if (
      value === null ||
      value === undefined ||
      value === 'null' ||
      value === 'undefined'
    ) {
      throw new Error(
        'sport_id cannot be null, undefined, or string representations of these',
      );
    }
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      throw new Error('sport_id must be a valid number');
    }
    return parsed;
  })
  sport_id: number;
}
