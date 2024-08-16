import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteRoleDto {
  @ApiProperty({
    example: '60b8d2958e4e1f001f8f2a5d',
    description:
      'The unique identifier of the role to delete, should be a valid MongoDB ObjectId',
  })
  @IsMongoId()
  @IsNotEmpty()
  @IsString()
  id: string;
}
