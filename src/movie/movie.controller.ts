import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	Put,
	Query,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';

import { Auth } from 'src/auth/decorators/auth.decorator';
import { IdValidationPipe } from 'src/pipes/id.validation.pipe';
import { MovieService } from './movie.service';
import { UpdateMovieDto } from './movie.dto';
import { Types } from 'mongoose';

@Controller('movies')
export class MovieController {
	constructor(private readonly movieService: MovieService) {}

	@Get('by-slug/:slug')
	async bySlug(@Param('slug') slug: string) {
		return await this.movieService.bySlug(slug);
	}

	@Get('/by-actor/:actorId')
	async byActor(@Param('actorId', IdValidationPipe) actorId: Types.ObjectId) {
		return await this.movieService.byActor(actorId);
	}

	@Post('/by-genres')
	@HttpCode(200)
	async byGenres(@Body('genreIds') genreIds: Types.ObjectId[]) {
		return await this.movieService.byGenres(genreIds);
	}

	@Get()
	async getAll(@Query('searchTerm') searchTerm?: string) {
		return await this.movieService.getAll(searchTerm);
	}

	@Get('most-popular')
	async getMostPopular() {
		return await this.movieService.getMostPopular();
	}

	@Put('update-count-opened')
	@HttpCode(200)
	async updateCountOpened(@Body() slug: string) {
		return await this.movieService.updateCountOpened(slug);
	}

	@Get(':id')
	@Auth('admin')
	async getById(@Param('id', IdValidationPipe) id: string) {
		return await this.movieService.byId(id);
	}

	@UsePipes(new ValidationPipe())
	@Post()
	@HttpCode(200)
	@Auth('admin')
	async create() {
		return await this.movieService.create();
	}

	@UsePipes(new ValidationPipe())
	@Put(':id')
	@HttpCode(200)
	@Auth('admin')
	async update(
		@Param('id', IdValidationPipe) id: string,
		@Body() dto: UpdateMovieDto
	) {
		return await this.movieService.update(id, dto);
	}

	@Delete(':id')
	@HttpCode(204)
	@Auth('admin')
	async delete(@Param('id', IdValidationPipe) id: string) {
		return await this.movieService.delete(id);
	}
}
