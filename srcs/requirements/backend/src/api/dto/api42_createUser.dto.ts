/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   api42_createUser.dto.ts                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: aptive <aptive@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/08/30 14:31:01 by aptive            #+#    #+#             */
/*   Updated: 2023/08/31 17:53:18 by aptive           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { ApiProperty } from "@nestjs/swagger";
import {IsEmail, IsNumber, IsString }from '@nestjs/class-validator';

export class api42_createUserDTO{

	@ApiProperty({
		description: 'Unique Email',
	})
	@IsEmail()
	readonly email : string;

	@ApiProperty({
		description: 'name User',
	})
	@IsString()
	readonly name? : string;

	@ApiProperty({
		description: 'Url image',
	})
	@IsString()
	readonly img? : string;
}
