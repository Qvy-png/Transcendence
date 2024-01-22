/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   historic.module.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: rpol <rpol@student.42.fr>                  +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/08/22 16:12:32 by aptive            #+#    #+#             */
/*   Updated: 2023/09/26 16:59:56 by rpol             ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Module } from '@nestjs/common';
import { HistoricController } from './historic.controller';
import { HistoricService } from './historic.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [HistoricController],
  providers: [HistoricService, PrismaService],
  exports: [HistoricService],
})
export class HistoricModule {}
