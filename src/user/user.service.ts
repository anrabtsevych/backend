import { Injectable, NotFoundException } from '@nestjs/common';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { InjectModel } from 'nestjs-typegoose';
import { UserModel } from './user.model';
import { UpdateUserDto } from './dto/user.dto';
import { genSalt, hash } from 'bcryptjs';
import { Types } from 'mongoose';

@Injectable()
export class UserService {
	constructor(
		@InjectModel(UserModel) private readonly userModel: ModelType<UserModel>
	) {}

	async byId(_id: string) {
		const user = await this.userModel.findById(_id);
		if (!user) throw new NotFoundException('User not found');
		return user;
	}

	async updateProfile(_id: string, dto: UpdateUserDto) {
		const user = await this.byId(_id);
		const isSameUser = await this.userModel.findOne({ email: dto.email });
		if (isSameUser && String(_id) === String(isSameUser._id))
			throw new NotFoundException('Email already in use');

		if (dto.password) {
			const salt = await genSalt(10);
			user.password = await hash(dto.password, salt);
		}
		user.email = dto.email;
		if (dto.isAdmin || dto.isAdmin === false) user.isAdmin = dto.isAdmin;

		await user.save();
		return;
	}

	async getCount() {
		return this.userModel.find().countDocuments().exec();
	}

	async getAll(searchTerm?: string) {
		let options = {};

		if (searchTerm) {
			options = {
				$or: [{ email: new RegExp(searchTerm, 'i') }],
			};
		}
		return this.userModel
			.find(options)
			.select('-password, -updatedAt -__v')
			.sort({ createdAt: 'desc' })
			.exec();
	}

	async delete(id: string) {
		return this.userModel.findByIdAndDelete(id).exec();
	}

	async toggleFavorites(movieId: Types.ObjectId, user: UserModel) {
		const { _id, favorites } = user;
		const favoritesArray = await this.userModel.findByIdAndUpdate(_id, {
			favorites: favorites.includes(movieId)
				? favorites.filter((id) => String(id) !== String(movieId))
				: [...favorites, movieId],
		});
		return favoritesArray;
	}

	async getFavoriteMovies(_id: string) {
		const user = await this.userModel
			.findById(_id, 'favorites')
			.populate({
				path: 'favorites',
				populate: { path: 'genres' },
			})
			.exec();

		if (!user) throw new NotFoundException('User not found');

		return user.favorites;
	}
}
