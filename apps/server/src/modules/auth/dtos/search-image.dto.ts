import { IsNotEmpty, IsString } from 'class-validator';

export class SearchImageDto {
  @IsString()
  @IsNotEmpty()
  type: 'photo';
}
