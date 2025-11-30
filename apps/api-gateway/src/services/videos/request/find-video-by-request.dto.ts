import { IsNotEmpty, IsString } from 'class-validator';

export class FindVideoRequestDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
