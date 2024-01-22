/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.module.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: aptive <aptive@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/08/31 16:47:41 by aptive            #+#    #+#             */
/*   Updated: 2023/09/01 00:18:09 by aptive           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
// import { LocalStrategy } from './local.strategy';
// import { TwoFactorStrategy } from './two-factor.strategy';

@Module({
  imports: [PassportModule],
  controllers:[AuthController],
  providers: [AuthService, PrismaService],
})
export class AuthModule {}
