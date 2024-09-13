import { IsEmail, IsString } from 'class-validator';

export class UpdateUserDto {
	@IsEmail({}, { message: 'Incorrect email format' })
	email: string;

	password?: string;

	isAdmin?: boolean;
}
