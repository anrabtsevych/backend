import { Injectable, NotFoundException, Type } from '@nestjs/common';
import { MovieModel } from './movie.model';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { InjectModel } from 'nestjs-typegoose';
import { UpdateMovieDto } from './movie.dto';
import { Types } from 'mongoose';
import { GenreIdsDto } from './dto/genreIds.dto';
import { TelegramService } from 'src/telegram/telegram.service';

@Injectable()
export class MovieService {
	constructor(
		@InjectModel(MovieModel) private readonly movieModel: ModelType<MovieModel>,
		private readonly telegramService: TelegramService
	) {}

	async getAllMovies() {
		const allMovies = await this.movieModel
			.find()
			.populate('actors genres')
			.exec();
		return allMovies;
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
		return this.movieModel
			.find(options)
			.select('-updatedAt -__v')
			.sort({ createdAt: 'desc' })
			.populate('actors genres')
			.exec();
	}
	async bySlug(slug: string) {
		const movie = await this.movieModel
			.findOne({ slug: new RegExp('^' + slug + '$', 'i') })
			.populate('actors genres')
			.exec();
		if (!movie) throw new NotFoundException('Movies not found');
		return movie;
	}

	async byActor(actorId: Types.ObjectId) {
		const actor = await this.movieModel.find({ actors: actorId }).exec();
		if (!actor) throw new NotFoundException('Movies not found');
		return actor;
	}

	async byGenres(genreIds: GenreIdsDto) {
		const movie = await this.movieModel
			.find({ genres: { $in: genreIds } })
			.exec();
		if (!movie) throw new NotFoundException('Movies not found');
		return movie;
	}

	async updateRating(id: Types.ObjectId, newRating: number) {
		return this.movieModel
			.findByIdAndUpdate(
				id,
				{
					rating: newRating,
				},
				{ new: true }
			)
			.exec();
	}

	async byId(_id: string) {
		const movie = await this.movieModel.findById(_id).exec();
		if (!movie) throw new NotFoundException('Movie not found');
		return movie;
	}

	async getMostPopular() {
		return await this.movieModel
			.findOne({ countOpened: { $gte: 0 } })
			.sort({ countOpened: -1 })
			.populate('genres')
			.exec();
	}

	async updateCountOpened(slug: string) {
		const updatedDoc = await this.movieModel
			.findOneAndUpdate({ slug }, { $inc: { countOpened: 1 } }, { new: true })
			.exec();
		if (!updatedDoc) throw new NotFoundException('Movie not found');
		return updatedDoc;
	}

	async create() {
		const defaultValue: UpdateMovieDto = {
			bigPoster: '',
			poster: '',
			title: '',
			slug: '',
			actors: [],
			genres: [],
			videoUrl: '',
		};
		try {
			const actor = await this.movieModel.create(defaultValue);
			return actor._id;
		} catch (error) {
			if (error.code === 11000) {
				throw new NotFoundException('Movie already exists');
			}
			throw error;
		}
	}

	async update(_id: string, dto: UpdateMovieDto) {
		const updatedDoc = await this.movieModel
			.findByIdAndUpdate(_id, dto, { new: true })
			.exec();
		if (!updatedDoc)
			throw new NotFoundException('Doc with this ID was not found');
		return updatedDoc;
	}

	async delete(id: string) {
		const deletedDoc = await this.movieModel.findByIdAndDelete(id).exec();
		if (!deletedDoc) throw new NotFoundException('Movie not found');
		return deletedDoc;
	}

	async sendNotification(dto: UpdateMovieDto) {
		// if (process.env.NODE_ENV !== 'development')
		// await this.telegramService.sendPhoto(dto.poster);
		await this.telegramService.sendPhoto(
			'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d'
		);
		const msg = `<b>${dto.title}</b>`;
		await this.telegramService.sendMessage(msg, {
			reply_markup: {
				inline_keyboard: [[{ url: '', text: 'Go to watch' }]],
			},
		});
	}
}
