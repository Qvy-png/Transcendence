/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   User.module.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: aptive <aptive@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/06/28 19:24:00 by aptive            #+#    #+#             */
/*   Updated: 2023/10/01 15:17:52 by aptive           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Module } from '@nestjs/common';
import { UserController } from './User.controller';
import { UserService } from './User.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule } from '@nestjs/config';



@Module({
  imports: [JwtModule.register({
      signOptions: {expiresIn: '30d'},
    }),
    MulterModule.register({
      dest: './uploads', // Le répertoire de destination où les fichiers téléchargés seront stockés
    }),
    ConfigModule.forRoot(),
  ],
  controllers: [UserController],
  providers: [UserService, PrismaService, JwtStrategy, JwtAuthGuard],
  exports: [UserService],
})
export class UserModule {}
