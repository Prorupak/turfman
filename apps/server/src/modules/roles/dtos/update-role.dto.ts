import { IsMongoId, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateRoleDto {
  @IsMongoId()
  @IsNotEmpty()
  @IsString()
  id: string;

  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  name: string;
}
