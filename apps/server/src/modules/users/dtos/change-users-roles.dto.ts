import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class ChangeUserRolesDto {
  @ApiProperty({
    description:
      'The MongoDB ObjectId of the user whose roles are being updated.',
    example: '60b8d295f1d2b32744bff4a3',
  })
  @IsMongoId()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description:
      'An array of role IDs to assign to the user. Each role ID should be unique and non-empty.',
    example: ['role1', 'role2', 'role3'],
    isArray: true,
  })
  @ArrayUnique()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @IsArray()
  roleIds: Array<string>;
}
