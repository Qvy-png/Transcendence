/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   User.controller.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: aptive <aptive@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/06/28 17:17:23 by aptive            #+#    #+#             */
/*   Updated: 2023/06/28 19:33:58 by aptive           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Controller, Get, Post, Body, Param, Patch, Delete, ValidationPipe, UseGuards, Request, UseInterceptors, UploadedFile, Res, InternalServerErrorException, ParseIntPipe, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserService } from './User.service';
import { CreateUserDto } from './dto/create_User.dto';
import { AuthCredentialsDto } from './dto/AuthCredentials.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from './current-user.decorator';
import { UpdateUserDto } from './dto/update_User.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import * as fs from 'fs';
import { Response } from 'express';

@Controller('User')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get()
	async findAll() {
		try {
			return await this.userService.findAll();
		} catch (error) {
			// loggez l'erreur ici si nécessaire
			throw new InternalServerErrorException('Une erreur s’est produite lors de la récupération des utilisateurs');
		}
	}

	@Get('/id/:id')
	async findById(@Param('id', ParseIntPipe) id: number) {
		try {
			return await this.userService.findById(id);
		} catch (error) {
			// loggez l'erreur ici si nécessaire
			throw new NotFoundException(`Utilisateur avec ID ${id} n'a pas été trouvé`);
		}
	}

	@Get('/findname/:name')
	async findByName(@Param('name') name: string)
	{
		return this.userService.findByName(name);
	}

	@Post()
	async createUser(@Body() newUser: CreateUserDto ) { // Renommez en createUser
		try {
			const user = await this.userService.create(newUser);
			return user;
		} catch (error) {
			// loggez l'erreur ici si nécessaire
			throw new InternalServerErrorException("Une erreur s’est produite lors de la création de l'utilisateur");
		}
	}

	@Post("/sign-up")
	signUp(@Body(ValidationPipe) CreateUserDTO: CreateUserDto )
	{
		return this.userService.create(CreateUserDTO);
	}

	@Post("/sign-in")
	signIn(@Body(ValidationPipe) AuthCredentialsDTO: AuthCredentialsDto )
	{
		return this.userService.signIn(AuthCredentialsDTO);
	}

	@Patch(':id')
	async updateUser(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
		try {
		return await this.userService.updateUser(id, updateUserDto);
		} catch (error) {
		// loggez l'erreur ici si nécessaire
			throw new InternalServerErrorException(`Une erreur s’est produite lors de la mise à jour de l'utilisateur ${id}`);
		}
	}

	@Delete(':id')
	async deleteUser(@Param('id', ParseIntPipe) id: number) { // Utilisez ParseIntPipe
		try {
			return await this.userService.delete(id);
		} catch (error) {
			// loggez l'erreur ici si nécessaire
			throw new NotFoundException(`Utilisateur avec ID ${id} n'a pas été trouvé`);
		}
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Get('/auth/me')
	getMyProfile(@CurrentUser() user : any ) {
		return this.userService.getMyProfile(user);
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Patch('/auth/me')
	async updateMyProfile(@CurrentUser() user: any, @Body(new ValidationPipe()) updateUserDto: UpdateUserDto) { // Ajoutez async
		try {
			return await this.userService.updateMyProfile(user, updateUserDto);
		} catch (error) {
			// loggez l'erreur ici si nécessaire
			throw new InternalServerErrorException(`Une erreur s’est produite lors de la mise à jour de l'utilisateur ${user.id}`);
		}
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Delete('/auth/me')
	deleteMyAccount(@CurrentUser() user : any )
	{
		return this.userService.deleteMyAccount(user);
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Post('uploadFile')
	@UseInterceptors(
		FileInterceptor('image', {
		storage: diskStorage({
			destination: './uploads',
			filename: (req, file, cb) => {
				const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
				cb(null, file.fieldname + '-' + uniqueSuffix + file.originalname);
				},
			}),
		}),
	)
	async uploadFile(@UploadedFile() file, @CurrentUser() user : any) {

		const originalFileName = file.originalname;
		const tempFilePath = file.path;
		const type = file.originalname.slice(file.originalname.indexOf('.') , file.originalname.length);
		const destinationFolder = './profile-pictures/';
		const name = "profile" + user.id + type;
		const newFilePath = destinationFolder + name;
		const newUrlImg = "http://localhost:3000/" + name;
		this.userService.updateURLImage(user.id, newUrlImg);
		const fs = require('fs');

		try {
			fs.renameSync(tempFilePath, newFilePath);
		} catch (error) {
			console.error('Erreur lors du déplacement du fichier', error);
			throw new InternalServerErrorException('Erreur lors du téléchargement du fichier');
		}
		return { message: 'Fichier téléchargé avec succès', filename: originalFileName };
	}

	@Get('/url/:imageName')
	async serveImage(@Param('imageName') imageName: string, @Res() res: Response) {
		const imagePath = join('/app/src/profile-pictures', imageName); // Utilisez join pour construire le chemin
		if (fs.existsSync(imagePath)) {
			res.sendFile(imagePath);
		} else {
			res.status(404).send(`L'image ${imageName} n'a pas été trouvée`);
		}
	}

}
