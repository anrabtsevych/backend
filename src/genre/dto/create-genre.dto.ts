import { IsString } from 'class-validator';

export class CreateGenreDto {
	@IsString()
	name: string;

	@IsString()
	description: string;

	@IsString()
	slug: string;

	@IsString()
	icon: string;
}

export type UpdateGenreDto = Partial<CreateGenreDto>;
