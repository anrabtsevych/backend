import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserModel } from 'src/user/user.model';

export class OnlyAdminGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<{ user: UserModel }>();
		const user = request.user;
		const isAdmin = user.isAdmin;

		if (!isAdmin)
			throw new ForbiddenException('Only admin can access this resource');
		return isAdmin;
	}
}
