/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.service.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: rpol <rpol@student.42.fr>                  +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/08/31 16:47:44 by aptive            #+#    #+#             */
/*   Updated: 2023/11/09 02:25:50 by rpol             ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { Strategy } from 'passport-2fa-totp';
// import { UserService } from '../User/User.service';
// import { CanActivate, ExecutionContext } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';

// @Injectable()
// export class TwoFactorStrategy extends PassportStrategy(Strategy, '2fa') {
//   constructor(private readonly usersService: UserService) {
//     super({
//       usernameField: 'email',
//       session: false,
//     });
//   }

//   async validate(user: any, token: string): Promise<any> {
//     const isValid = await this.usersService.validateTwoFactorToken(
//       user.id,
//       token,
//     );
//     if (!isValid) {
//       throw new UnauthorizedException('Invalid 2FA token');
//     }
//     return user;
//   }
// }

// @Injectable()
// export class TwoFactorGuard implements CanActivate {
//   constructor(
// 	private readonly reflector: Reflector,
// 	private readonly usersService: UserService
// 	) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest();
//     const user = request.user;
//     const is2FAEnabled = await this.usersService.isTwoFactorEnabled(user.id);

//     if (!is2FAEnabled) {
//       return true;
//     }

//     const token = request.body.twoFactorToken; // Supposons que le token soit envoyé dans la requête

//     if (!token) {
//       return false;
//     }

//     return this.usersService.validateTwoFactorToken(user, token);
//   }
// }

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async generateTwoFactorSecret(userId: number): Promise<string> {
    // Generates and returns a unique secret key for the user
    const secret = speakeasy.generateSecret({ length: 5 });
    return secret.base32; // Return the base32 encoded secret
  }

  async generateQRCodeURL(email: string, secret: string): Promise<string> {
    // Generates and returns the QR Code URL for the authenticator app
    const otpauthURL = speakeasy.otpauthURL({
      secret: secret,
      label: encodeURIComponent(email), // Ensure special characters are URL-encoded
      issuer: 'TRANS', // The name of your application
      encoding: 'base32',
    });

    try {
      const qrCodeDataURL = await QRCode.toDataURL(otpauthURL);
      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating QR Code', error);
      throw error; // Rethrow the error or handle it as you see fit
    }
  }

  async saveTwoFactorSecret(userId: number, secret: string): Promise<void> {
    // Save the user's secret key to the database
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret,
      },
    });
  }

  async validateTwoFactorToken(userId: number, token: string): Promise<boolean> {
    
    
    // Validate the 2FA token provided by the user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.twoFactorSecret) {
      throw new Error('2FA is not setup for this user');
    }
    
    console.error("Secret ", user.twoFactorSecret);
    console.error("Status ", user.twoFactor);
    console.error("Token ", token);
    console.error("UserId ", userId);
    
    const isTokenValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
    });

    if (!user.twoFactor && isTokenValid) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          twoFactor: true
        },
      });
      console.error("ADDED 2FA TRUE TO DATABASE");
    }
    return isTokenValid;
  }

  async isTwoFactorEnabled(id: number): Promise<boolean> {
    // Checks if 2FA is enabled for the user
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user?.twoFactor || false;
  }

  async removeTwoFactorSecret(userId: number): Promise<void> {
    // Remove the user's secret key to disable 2FA
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: null, // Remove the secret key by setting it to null
        twoFactor: false,      // Update the 2FA status to false
      },
    });
  }
}
