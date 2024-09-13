import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { InjectModel } from 'nestjs-typegoose';
import { UserModel } from 'src/user/user.model';
import { AuthDto } from './dto/auth.dto';
import { hash, compare, genSalt } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenDto } from './dto/refreshToken.dto';

@Injectable()
export class AuthService {
	constructor(
		private readonly jwtService: JwtService,
		@InjectModel(UserModel) private readonly userModel: ModelType<UserModel>
	) {}
	async register(dto: AuthDto) {
		const oldUser = await this.userModel.findOne({ email: dto.email });
		if (oldUser) {
			throw new BadRequestException('User with this email already exists');
		}
		const salt = await genSalt(10);
		const newUser = new this.userModel({
			email: dto.email,
			password: await hash(dto.password, salt),
		});
		const user = await newUser.save();
		const tokens = await this.issueTokenPair(String(user._id));
		return {
			user: this.returnUserFields(user),
			...tokens,
		};
	}

	async getNewTokens({ refreshToken }: RefreshTokenDto) {
		if (!refreshToken) throw new UnauthorizedException('Please sign in!');

		const result = await this.jwtService.verifyAsync(refreshToken);
		if (!result) throw new UnauthorizedException('Invalid token or expired');
		const user = await this.userModel.findById(result._id);
		const tokens = await this.issueTokenPair(String(user._id));
		return {
			user: this.returnUserFields(user),
			...tokens,
		};
	}

	async login(dto: AuthDto) {
		const user = this.validateUser(dto);
		const tokens = await this.issueTokenPair(String((await user)._id));

		return {
			user: this.returnUserFields(await user),
			...tokens,
		};
	}

	async validateUser(dto: AuthDto): Promise<UserModel> {
		const user = await this.userModel.findOne({ email: dto.email });
		if (!user) {
			throw new UnauthorizedException('User not found');
		}
		const isValidPassword = await compare(dto.password, user.password);
		if (!isValidPassword) {
			throw new UnauthorizedException('Invalid password');
		}
		return user;
	}

	async issueTokenPair(userId: string) {
		const data = { _id: userId };
		const refreshToken = await this.jwtService.signAsync(data, {
			expiresIn: '15d',
		});

		const accessToken = await this.jwtService.signAsync(data, {
			expiresIn: '1h',
		});
		return { refreshToken, accessToken };
	}

	async returnUserFields(user: UserModel) {
		return {
			_id: user._id,
			email: user.email,
			isAdmin: user.isAdmin,
		};
	}
}
