/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   User.service.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: aptive <aptive@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/06/28 17:17:15 by aptive            #+#    #+#             */
/*   Updated: 2023/08/22 19:42:26 by aptive           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Injectable, NotFoundException, UnauthorizedException, Param } from '@nestjs/common';
import { User } from './interfaces/User.interfaces'
// import { Historic } from './interfaces/Historic.interfaces';
import { CreateUserDto } from './dto/create_User.dto';
import { PrismaService } from '../prisma/prisma.service';
import { hash, compare } from "bcryptjs"
import {AuthCredentialsDto} from './dto/AuthCredentials.dto'
import { JwtService } from '@nestjs/jwt';
import { UpdateUserDto } from './dto/update_User.dto';


@Injectable()
export class UserService {

	constructor(
		private readonly prisma: PrismaService,
		private readonly jwtService: JwtService){
	}

	findALL(){
		return this.prisma.user.findMany();
	}

	// findById(id : number){
	// 	return this.prisma.user.findUnique({ where : { id }});
	// }

	private creatAuthenticationToken(userId: number) : string {
		return this.jwtService.sign({
			userId,
		},
		{
			secret: 'my-secret',
		}
		);
	}

	async create(createUserDTO: CreateUserDto){
		// hash password
		createUserDTO.password = await hash(createUserDTO.password, 10);

		await this.prisma.user.create({
			data: createUserDTO,
		});
	}

	private async  findById(id : number){
		const user = await this.prisma.user.findUnique({
			where: { id },
		});

		if (!user) {
			throw new NotFoundException('user with id ${id} not found');
		}

		return user;
	}

	async  findByName(@Param('name') name: string){
		const user = await this.prisma.user.findMany({
			where: { name },
		});

		if (!user) {
			throw new NotFoundException('user with name ${name} not found');
		}

		return user || null;
	}

	private async findByEmail(email: string){
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

		const token = this.creatAuthenticationToken(user.id);

		return {
			token,
		};




	}

	// update(id : string, todo: User) {
	// 	const todoToUpdate = this.todos.find(t => t.id === Number(id))
	// 	if (!todoToUpdate)
	// 		return new NotFoundException ('Not found oups');

	// 	// apply to granualry update

	// 	if (todo.hasOwnProperty('done')){
	// 		todoToUpdate.done = todo.done;
	// 	}
	// 	if (todo.title)
	// 	{
	// 		todoToUpdate.title = todo.title
	// 	}
	// 	if (todo.description)
	// 	{
	// 		todoToUpdate.description = todo.description
	// 	}

	// 	const updatedTodo = this.todos.map(t => t.id !== Number(id) ? t : todoToUpdate)
	// 	this.todos = [...updatedTodo];
	// 	return {updateTodo: 1, todo: todoToUpdate};
	// }
	async updateUser(id: number, updateUserDto: CreateUserDto): Promise<boolean> {
		try {
			const { email, name } = updateUserDto;
			const updatedUser = await this.prisma.user.update({
				where: { id },
				data: { email, name },
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
		return { profile: user};
	}

	async deleteMyAccout(user : any){
		await this.prisma.user.delete({where:{id:user.id}})

		return {
			message : 'Your account is successfully deleted.',
		}
	}

	async UpdateMyProfile(user : any , updateUserDto: UpdateUserDto) {
		console.log("UpdateMyProfile service")
		console.log(user);

		const { email, name , img, status, games, wins, looses, rank} = updateUserDto;

		const updatedUser = await this.prisma.user.update({
			where: { id:user.id },
			data: { email, name , img, status, games, wins, looses, rank },
		});

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
