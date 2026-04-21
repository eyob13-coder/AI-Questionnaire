import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Jane Smith' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'jane@company.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecureP@ss123' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Acme Inc.', required: false })
  @IsString()
  @IsOptional()
  company?: string;
}
