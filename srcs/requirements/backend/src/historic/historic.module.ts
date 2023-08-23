/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   historic.module.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: aptive <aptive@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/08/22 16:12:32 by aptive            #+#    #+#             */
/*   Updated: 2023/08/22 16:12:49 by aptive           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Module } from '@nestjs/common';
import { HistoricController } from './historic.controller';
import { HistoricService } from './historic.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [HistoricController],
  providers: [HistoricService, PrismaService]
})
export class HistoricModule {}
