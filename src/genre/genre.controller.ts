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
import { GenreService } from './genre.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { IdValidationPipe } from 'src/pipes/id.validation.pipe';
import { CreateGenreDto } from './dto/create-genre.dto';

@Controller('genre')
export class GenreController {
	constructor(private readonly genreService: GenreService) {}

	@Get('by-slug/:slug')
	async bySlug(@Param('slug') slug: string) {
		return await this.genreService.bySlug(slug);
	}

	@Get('/collections')
	async getCollections() {
		return await this.genreService.getCollections();
	}

	@Get()
	async getAll(@Query('searchTerm') searchTerm?: string) {
		return await this.genreService.getAll(searchTerm);
	}

	@Get(':id')
	@Auth('admin')
	async getById(@Param('id', IdValidationPipe) id: string) {
		return await this.genreService.byId(id);
	}

	@UsePipes(new ValidationPipe())
	@Post()
	@HttpCode(200)
	@Auth('admin')
	async create() {
		return await this.genreService.create();
	}

	@UsePipes(new ValidationPipe())
	@Put(':id')
	@HttpCode(200)
	@Auth('admin')
	async update(
		@Param('id', IdValidationPipe) id: string,
		@Body() dto: CreateGenreDto
	) {
		return await this.genreService.update(id, dto);
	}

	@Delete(':id')
	@HttpCode(204)
	@Auth('admin')
	async delete(@Param('id', IdValidationPipe) id: string) {
		return await this.genreService.delete(id);
	}
}
