/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   api.module.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: aptive <aptive@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/08/25 15:31:27 by aptive            #+#    #+#             */
/*   Updated: 2023/10/01 15:31:42 by aptive           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from '../User/jwt.strategy';
import { JwtAuthGuard } from '../User/jwt-auth.guard';
import { UserService } from 'src/User/User.service';
import { ConfigModule } from '@nestjs/config';



@Module({
  imports: [JwtModule.register({
    signOptions: {expiresIn: '30d'},
  }),
  ConfigModule.forRoot(),
],
  controllers: [ApiController],
  providers: [ApiService, PrismaService, UserService, JwtStrategy, JwtAuthGuard, JwtService]
})
export class ApiModule {}
