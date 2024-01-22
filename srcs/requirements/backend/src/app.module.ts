/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   app.module.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: rpol <rpol@student.42.fr>                  +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/06/28 16:45:40 by aptive            #+#    #+#             */
/*   Updated: 2023/08/31 18:34:21 by aptive           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './User/User.module';
import { PrismaService } from './prisma/prisma.service';
import { HistoricModule } from './historic/historic.module';
import { ApiModule } from './api/api.module';
import { AuthModule } from './auth/auth.module';
import { PongGateway } from './pong/pong.module';
import { GameGateway } from './pong/game.module';
import { ServeStaticModule } from '@nestjs/serve-static/dist/serve-static.module';
import { join } from 'path';
import { MessageSender } from './chat/chat.module';


@Module({
  imports: [UserModule, HistoricModule, ApiModule, AuthModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'profile-pictures'),
  }),],
  controllers: [AppController],
  providers: [AppService, PrismaService, PongGateway, GameGateway, MessageSender],
})
export class AppModule {}



// @Module({
//     imports: [
//         ServeStaticModule.forRoot({
//             rootPath: join(__dirname, '..', 'public'),
//         }),
//     ],
// })