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
import { ActorService } from './actor.service';
import { ActorDto } from './actor.dto';

@Controller('actors')
export class ActorController {
	constructor(private readonly actorService: ActorService) {}

	@Get('by-slug/:slug')
	async bySlug(@Param('slug') slug: string) {
		return await this.actorService.bySlug(slug);
	}

	@Get()
	async getAllActors() {
		return await this.actorService.getAllActors();
	}

	@Get()
	async getAll(@Query('searchTerm') searchTerm?: string) {
		return await this.actorService.getAll(searchTerm);
	}

	@Get(':id')
	@Auth('admin')
	async getById(@Param('id', IdValidationPipe) id: string) {
		return await this.actorService.byId(id);
	}

	@UsePipes(new ValidationPipe())
	@Post()
	@HttpCode(200)
	@Auth('admin')
	async create() {
		return await this.actorService.create();
	}

	@UsePipes(new ValidationPipe())
	@Put(':id')
	@HttpCode(200)
	@Auth('admin')
	async update(
		@Param('id', IdValidationPipe) id: string,
		@Body() dto: ActorDto
	) {
		return await this.actorService.update(id, dto);
	}

	@Delete(':id')
	@HttpCode(204)
	@Auth('admin')
	async delete(@Param('id', IdValidationPipe) id: string) {
		return await this.actorService.delete(id);
	}
}
