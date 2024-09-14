import { Injectable, NotFoundException } from '@nestjs/common';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { InjectModel } from 'nestjs-typegoose';
import { ActorModel } from './actor.model';
import { ActorDto } from './actor.dto';

@Injectable()
export class ActorService {
	constructor(
		@InjectModel(ActorModel) private readonly actorModel: ModelType<ActorModel>
	) {}

	async bySlug(slug: string) {
		const actor = await this.actorModel
			.findOne({ slug: new RegExp('^' + slug + '$', 'i') })
			.exec();
		if (!actor) throw new NotFoundException('Actor not found');
		return actor;
	}

	async getAllActors() {
		const allActors = await this.actorModel.find().exec();
		return allActors;
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
		//Todo: Add aggregation to get the count of movies for each genre
		return this.actorModel
			.find(options)
			.select('-updatedAt -__v')
			.sort({ createdAt: 'desc' })
			.exec();
	}

	async byId(_id: string) {
		const genre = await this.actorModel.findById(_id).exec();
		if (!genre) throw new NotFoundException('Actor not found');
		return genre;
	}

	async create() {
		const defaultValue: ActorDto = {
			name: '',
			slug: '',
			photo: '',
		};
		try {
			const actor = await this.actorModel.create(defaultValue);
			return actor._id;
		} catch (error) {
			if (error.code === 11000) {
				throw new NotFoundException('Actor already exists');
			}
			throw error;
		}
	}

	async update(_id: string, dto: ActorDto) {
		const updatedDoc = await this.actorModel
			.findByIdAndUpdate(_id, dto, { new: true })
			.exec();
		if (!updatedDoc)
			throw new NotFoundException('Doc with this ID was not found');
		return updatedDoc;
	}

	async delete(id: string) {
		const deletedDoc = await this.actorModel.findByIdAndDelete(id).exec();
		if (!deletedDoc) throw new NotFoundException('Actor not found');
		return deletedDoc;
	}
}
