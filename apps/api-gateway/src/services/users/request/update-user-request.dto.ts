import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateUserRequestDto {
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsDateString()
  @IsOptional()
  dob?: string;
}
