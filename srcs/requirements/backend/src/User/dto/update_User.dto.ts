/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   update_User.dto.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: aptive <aptive@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/08/22 19:36:10 by aptive            #+#    #+#             */
/*   Updated: 2023/09/11 15:48:44 by aptive           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { ApiProperty } from "@nestjs/swagger";
import {IsEmail, IsNumber, IsString, IsArray }from '@nestjs/class-validator';
import { Status } from "../interfaces/User.interfaces";
import { IsEnum } from "class-validator";

export class UpdateUserDto {

	@ApiProperty({
		description: 'Unique Email',
	})
	@IsEmail()
	readonly email? : string;

	@ApiProperty({
		description: 'password User',
	})
	@ApiProperty({
		description: 'password',
	})
	@IsString()
	password? : string;

	@ApiProperty({
		description: 'name',
	})
	@IsString()
	readonly name? : string;

	@ApiProperty({
		description: 'img',
	})
	@IsString()
	readonly img? : string;

	@ApiProperty({
		description: 'status',
	})
	@IsString()
	readonly status? : string;

	@ApiProperty({
		description: 'games',
	})
	@IsNumber()
	readonly games? : number;

	@ApiProperty({
		description: 'wins',
	})
	@IsNumber()
	readonly wins? : number;

	@ApiProperty({
		description: 'looses',
	})
	@IsNumber()
	readonly looses? : number;

	@ApiProperty({
		description: 'rank',
	})
	@IsNumber()
	readonly rank? : number;

	@ApiProperty({
		description: 'twoFactorSecret',
	})
	@IsString()
	readonly twoFactorSecret? : number;

	@ApiProperty({
		description: 'Friend List',
		isArray: true, // Spécifiez que c'est un tableau
		type: Number, // Le type d'élément du tableau
	  })
	  @IsArray()
	  readonly friendList?: number[];

	@ApiProperty({
	description: 'pending Request',
	isArray: true, // Spécifiez que c'est un tableau
	type: Number, // Le type d'élément du tableau
	})
	@IsArray()
	readonly pendingRequest?: number[];
	
	@ApiProperty({
	description: 'Block List',
	isArray: true, // Spécifiez que c'est un tableau
	type: Number, // Le type d'élément du tableau
	})
	@IsArray()
	readonly blockedUsers?: number[];
}
