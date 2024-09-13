import { IsEmail, IsString, MinLength } from 'class-validator';

export class AuthDto {
  @IsString()
  @IsEmail()
  email: string;

  @MinLength(6, {
    message: 'Password is too short, password cannot be less than 6 chars',
  })
  @IsString()
  password: string;
}
