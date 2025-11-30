import { IsNotEmpty, IsString } from 'class-validator';

export class FindUserByIdRequestDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
