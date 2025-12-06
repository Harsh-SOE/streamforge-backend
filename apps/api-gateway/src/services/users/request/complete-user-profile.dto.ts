import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class CompleteUserProfileDto {
  @IsString()
  @IsNotEmpty()
  authId: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  handle: string;

  @IsString()
  @IsNotEmpty()
  avatar: string;

  @IsPhoneNumber()
  @IsOptional()
  phoneNumber?: string;

  @IsDateString()
  @IsOptional()
  dob?: string;
}
