import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateGenreDto, UpdateGenreDto } from './dto/create-genre.dto';
import { InjectModel } from 'nestjs-typegoose';
import { GenreModel } from './genre.model';
import { ModelType } from '@typegoose/typegoose/lib/types';

@Injectable()
export class GenreService {
	constructor(
		@InjectModel(GenreModel) private readonly genreModel: ModelType<GenreModel>
	) {}

	async bySlug(slug: string) {
		return this.genreModel.findOne({ slug }).exec();
	}

	async getAll(searchTerm?: string) {
		let options = {};

		if (searchTerm) {
			options = {
				$or: [
					{ name: new RegExp(searchTerm, 'i') },
					{ slug: new RegExp(searchTerm, 'i') },
					{ description: new RegExp(searchTerm, 'i') },
				],
			};
		}
		return this.genreModel
			.find(options)
			.select('-updatedAt -__v')
			.sort({ createdAt: 'desc' })
			.exec();
	}

	async create() {
		const defaultValue: CreateGenreDto = {
			name: '',
			description: '',
			slug: '',
			icon: '',
		};
		const genre = await this.genreModel.create(defaultValue);
		return genre._id;
	}

	async byId(_id: string) {
		const genre = await this.genreModel.findById(_id).exec();
		if (!genre) throw new NotFoundException('Genre not found');
		return genre;
	}

	async update(_id: string, dto: UpdateGenreDto) {
		const genre = await this.genreModel
			.findByIdAndUpdate(_id, dto, { new: true })
			.exec();
		return genre;
	}

	async getCollections() {
		return this.genreModel.find().countDocuments().exec();
	}

	async delete(id: string) {
		return this.genreModel.findByIdAndDelete(id).exec();
	}
}
