import {
  ArrayUnique,
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class ChangeUserRolesDto {
  @IsMongoId()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ArrayUnique()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @IsArray()
  roleIds: Array<string>;
}
