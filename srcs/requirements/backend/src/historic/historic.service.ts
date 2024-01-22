/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   historic.service.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: rpol <rpol@student.42.fr>                  +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/08/22 18:19:31 by aptive            #+#    #+#             */
/*   Updated: 2023/09/26 16:44:32 by rpol             ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {CreateHistoricGameDto} from './dto/create-historic.dto'


@Injectable()
export class HistoricService {
	constructor(private readonly prisma: PrismaService) {}


	async createHistoricGame(id: number, CreateHistoricGameDto: CreateHistoricGameDto)
	{
		console.log("HEREE");
		try
		{
			await this.prisma.historic.create ({
				data: CreateHistoricGameDto,

			});
			console.log("ADDED NEW GAME HISTORY FOR USER:",id );
		}
		catch
		{
			throw new Error('Method not implemented.');
		}
	}

	findALL(){
		return this.prisma.historic.findMany();
	}

	async  findMatchById(userId : number){
		console.log(userId)
		const historicGame = await this.prisma.historic.findMany({
			where: { userId:  Number(userId)  },
		});

		if (!historicGame) {
			throw new NotFoundException('historicGame with UserId ${userId} not found');
		}

		return historicGame;
	}
}
