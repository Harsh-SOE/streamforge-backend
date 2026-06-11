import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateVideoDraftRequestDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  categories: string[];
}
