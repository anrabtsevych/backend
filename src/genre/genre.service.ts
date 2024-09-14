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
		const genre = await this.genreModel
			.findOne({ slug: new RegExp('^' + slug + '$', 'i') })
			.exec();
		if (!genre) throw new NotFoundException('Genre not found');
		return genre;
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
		try {
			const genre = await this.genreModel.create(defaultValue);
			return genre._id;
		} catch (error) {
			if (error.code === 11000) {
				throw new NotFoundException('Genre already exists');
			}
			throw error;
		}
	}

	async byId(_id: string) {
		const genre = await this.genreModel.findById(_id).exec();
		if (!genre) throw new NotFoundException('Genre not found');
		return genre;
	}

	async update(_id: string, dto: UpdateGenreDto) {
		const updatedGenre = await this.genreModel
			.findByIdAndUpdate(_id, dto, { new: true })
			.exec();
		if (!updatedGenre) throw new NotFoundException('Genre not found');
		return updatedGenre;
	}

	async getCollections() {
		const collections = await this.genreModel.find().countDocuments().exec();
		if (!collections) throw new NotFoundException('Collections not found');
		const genres = await this.getAll();
		return {
			collections,
			genres,
		};
	}

	async delete(id: string) {
		const deletedGenre = await this.genreModel.findByIdAndDelete(id).exec();
		if (!deletedGenre) throw new NotFoundException('Genre not found');
		return deletedGenre;
	}
}
