/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   historic.controller.ts                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: aptive <aptive@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/08/22 16:16:18 by aptive            #+#    #+#             */
/*   Updated: 2023/08/22 19:04:43 by aptive           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {CreateHistoricGameDto} from './dto/create-historic.dto'
import {HistoricService} from './historic.service'
import { JwtAuthGuard } from 'src/User/jwt-auth.guard';

@Controller('/historic')
export class HistoricController {
	constructor(private readonly HistoricService: HistoricService) {}

	// @UseGuards(JwtAuthGuard)
	@Post()
	async createHistoricGame(
		@Param('id') id: number,
		@Body() CreateHistoricGameDto: CreateHistoricGameDto,
		)
		{
			console.log("test")
			return this.HistoricService.createHistoricGame(id, CreateHistoricGameDto);
		}

	@Get("/getAll")
	findALL() {
		return this.HistoricService.findALL();
	}

	@Get(":userId")
	findMatchById(@Param('userId') userId: number)
	{
		console.log(userId)

		return this.HistoricService.findMatchById(userId);
	}

}
