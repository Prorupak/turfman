import { ApiProperty } from '@nestjs/swagger';

export class RoleDto {
  @ApiProperty({
    example: 'Administrator',
    description: 'The name of the role',
  })
  name: string;

  @ApiProperty({ example: 1, description: 'The sorting order of the role' })
  sort: number;

  @ApiProperty({
    example: false,
    description: 'Indicates if the role is default or not',
  })
  default: boolean;

  @ApiProperty({
    example: '2024-08-16T08:32:51.097Z',
    description: 'The date the role was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-08-16T08:32:51.097Z',
    description: 'The date the role was last updated',
  })
  updatedAt: Date;

  @ApiProperty({
    example: '66bf0eb3f8b8efe0752eada9',
    description: 'The unique identifier of the role',
  })
  id: string;
}
