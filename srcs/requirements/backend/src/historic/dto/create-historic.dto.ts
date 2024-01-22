/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   create-historic.dto.ts                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: aptive <aptive@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/08/22 16:16:42 by aptive            #+#    #+#             */
/*   Updated: 2023/08/23 14:24:59 by aptive           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNumber } from "class-validator";

export class CreateHistoricGameDto {
	@ApiProperty({
		description: 'Id User',
	})
	@IsNumber()
	userId: number;

	@ApiProperty({
		description: 'opponentName User',
	})
	@IsString()
	opponentName: string;

	@ApiProperty({
		description: 'Winner',
	})
	@IsNumber()
	winner: string;

	@ApiProperty({
		description: 'score User',
	})
	@IsNumber()
	scorePlayerOne: number;

	@ApiProperty({
		description: 'score Opponent',
	})
	@IsNumber()
	scorePlayerTwo: number;

	@ApiProperty({
		description: 'data ?',
	})
	@IsString()
	date: string;

	@ApiProperty({
		description: 'mode',
	})
	@IsString()
	mode: string;
}
