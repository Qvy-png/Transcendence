/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   api.controller.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: aptive <aptive@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/08/25 15:31:24 by aptive            #+#    #+#             */
/*   Updated: 2023/08/31 16:11:18 by aptive           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Controller , Get, Query, Redirect, Res} from '@nestjs/common';
import { Response , CookieOptions} from 'express';
import { ApiService } from './api.service';
import { JwtService } from '@nestjs/jwt';
import * as cookieParser from 'cookie-parser';


@Controller('api42')
export class ApiController {

  constructor(
    private readonly ApiService: ApiService,
    private readonly jwtService: JwtService,

    ) {}
  static jwtService: any;



    @Get('callback')
      async handleAuthorizationCallback(@Query('code') code: string, @Res() res: Response) {
      try {

        const CodeResponse = await this.ApiService.requeteForCode(code);
        console.log('Access token received:', CodeResponse.access_token);
        const profile = await this.ApiService.getProfileWithAccessToken(CodeResponse.access_token);
        const cursusArray = profile.cursus_users;
        const users = cursusArray.map(cursus => cursus.user);


        if (!await this.ApiService.findByEmailApitest(users[0].email))
          this.ApiService.create(users[0].login, users[0].email, users[0].image);

        const user = await this.ApiService.findByEmailApi(users[0].email);

        const accessToken = this.jwtService.sign({
          userId: user.id,
        }, {
          secret: 'my-secret',
        });


        // Définir le cookie avec le token
        const cookieOptions: CookieOptions = {
          httpOnly: false,
          // Autres options de cookie si nécessaire
        };

        res.cookie('access_token', accessToken, cookieOptions);
        // res.set('Authorization', `Bearer ${accessToken}`);
        
        
        
        
        
        res.redirect(302, 'http://localhost:4200');

      } catch (error) {
        console.error('Error exchanging code for access token:', error);
      }
    }
}
