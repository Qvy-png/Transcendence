/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   User.service.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: aptive <aptive@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/06/28 17:17:15 by aptive            #+#    #+#             */
/*   Updated: 2023/10/01 15:32:21 by aptive           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */



import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
	Param,
	InternalServerErrorException
} from '@nestjs/common';
import { User } from './interfaces/User.interfaces';
import { CreateUserDto } from './dto/create_User.dto';
import { PrismaService } from '../prisma/prisma.service';
import { hash, compare } from "bcryptjs";
import { AuthCredentialsDto } from './dto/AuthCredentials.dto';
import { JwtService } from '@nestjs/jwt';
import { UpdateUserDto } from './dto/update_User.dto';
import { ConfigService } from '@nestjs/config';
import { log } from 'console';


// import { User } from './interfaces/User.interfaces'
// import { CreateUserDto } from './dto/create_User.dto';
// import { PrismaService } from '../prisma/prisma.service';
// import { hash, compare } from "bcryptjs"
// import { AuthCredentialsDto } from './dto/AuthCredentials.dto'
// import { JwtService } from '@nestjs/jwt';
// import { UpdateUserDto } from './dto/update_User.dto';


@Injectable()
export class UserService {
	// static jwtService: any;
	// static prisma: any;

	constructor(
		private readonly prisma: PrismaService,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService
		){
	}


	// +--------------------------------------------------------------------------------+
	// |                                  Module User                                   |
	// +--------------------------------------------------------------------------------+

	// Find all users
	async findAll(): Promise<User[]> {
		try {
			return await this.prisma.user.findMany();
		} catch (error) {
			throw new InternalServerErrorException(`Failed to get all users: ${error.message}`);
		}
	}

	// Create Authentication Token
	createAuthenticationToken(userId: number): string {
		return this.jwtService.sign({ userId }, { secret: this.configService.get<string>('JWT_SECRET') });
	}

	// Create User
	async create(createUserDTO: CreateUserDto): Promise<User> {
		try {
			createUserDTO.password = await hash(createUserDTO.password, 10);
			return await this.prisma.user.create({ data: createUserDTO });
		} catch (error) {
			throw new InternalServerErrorException(`Failed to create user: ${error.message}`);
		}
	}

	async findById(id : number) {
		try {
			const user = await this.prisma.user.findUnique({where: { id: Number(id) }});
			if (!user) throw new NotFoundException(`User with id ${id} not found`);
			return user;
		} catch (error) {
			// Ici, loggez l'erreur avec un logger si nécessaire.
			throw new InternalServerErrorException(`Failed to get user with id ${id}: ${error.message}`);
		}
	}

	// Find user by Name
	async findByName(name: string): Promise<User[]> {
		try {
			const users = await this.prisma.user.findMany({ where: { name } });
			if (!users || users.length === 0) throw new NotFoundException(`User with name ${name} not found`);
			return users;
		}
		 catch (error) {
			if (error instanceof NotFoundException) throw error;
			throw new InternalServerErrorException(`Failed to get user with name ${name}: ${error.message}`);
		}
	}

	async findByEmail(email: string){
		const user = await this.prisma.user.findUnique({
			where: { email },
		});

		if (!user) {
			throw new NotFoundException('user with email ${email} not found');
		}

		return user;
	}

	async signIn(authCredentialsDTO: AuthCredentialsDto){

		let user : User;

		try {
			user = await this.findByEmail(authCredentialsDTO.email);
		} catch {
			throw new UnauthorizedException('invalid credentials');
		}

		const validPassword = await compare(
			authCredentialsDTO.password,
			user.password,
			);

			if (!validPassword){
				throw new UnauthorizedException('invalid credentials')
			}

			console.log (user.id);
			const token = this.createAuthenticationToken(user.id);

			return {
				token,
			};
		}

		async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<boolean> {
		try {
			const { email, name , img, status, games, wins, looses, rank, friendList, pendingRequest, blockedUsers, twoFactorSecret} = updateUserDto;

			const updatedUser = await this.prisma.user.update({
				where: { id },
				data: { email, name , img, status, games, wins, looses, rank, friendList, pendingRequest, blockedUsers },

			});
			return !!updatedUser;
		} catch (error) {
			throw new Error(`Failed to update user: ${error.message}`);
		}
	}

	async updateURLImage(id: number, img: string): Promise<boolean> {
		try {
			const updatedUser = await this.prisma.user.update({
				where: { id },
				data: {img},
			});
			return !!updatedUser;
		} catch (error) {
			throw new Error(`Failed to update user: ${error.message}`);
		}
	}

	delete(id: number){
		return this.prisma.user.delete({where: {id}});
	}

	getMyProfile(user : any) {
		console.log('getProfile:');
		console.log(user)
		return { profile: user};
	}

	async deleteMyAccount(user : any){
		await this.prisma.user.delete({where:{id:user.id}})

		return {
			message : 'Your account is successfully deleted.',
		}
	}

	async updateMyProfile(user : any , updateUserDto: UpdateUserDto) {

		const { email, name , img, status, games, wins, looses, rank, friendList, pendingRequest, twoFactorSecret} = updateUserDto;
		const updatedUser = await this.prisma.user.update({
			where: { id: user.id },
			data: { email, name , img, status, games, wins, looses, rank, friendList, pendingRequest },
		});

		console.log("updateMyProfile service");
		console.log(user);

		// try {
		// 	const { email, name } = updateUserDto;
		// 	const updatedUser = await this.prisma.user.update({
		// 		where: { id },
		// 		data: { email, name },
		// 	});
		// 	return !!updatedUser;
		// } catch (error) {
		// 	throw new Error(`Failed to update user: ${error.message}`);
		// }
		// return this.UserServices.UpdateMyProfile(user);
	}
}
