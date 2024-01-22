/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   api.service.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: aptive <aptive@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/08/25 15:31:30 by aptive            #+#    #+#             */
/*   Updated: 2023/10/01 15:49:26 by aptive           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import {api42_createUserDTO} from './dto/api42_createUser.dto'
import axios from 'axios';
import { UserService } from 'src/User/User.service';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class ApiService {
  static jwtService: any;

  constructor(
		private readonly prisma: PrismaService,
    private readonly jwtService: JwtService, // Assurez-vous que JwtService est injecté ici
    private readonly configService: ConfigService,

  ) {}

    private static accessToken: string = ''; // Stocke l'access_token ici    static accessToken: any;
  // prisma: any;

    static async fetchDataFromExternalApi(): Promise<any> {
        const requestData =
        `grant_type=client_credentials&client_id=` + process.env.CLIENT_ID as string
        +`&client_secret=` + process.env.CLIENT_SECRET as string;

        try {
            const response = await axios.post('https://api.intra.42.fr/oauth/token', requestData, {
            headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
            console.log("---------------------------- Token oauth api 42 --------------------------------")

            ApiService.accessToken = response.data.access_token;
            return response.data; // Renvoie uniquement la réponse de l'API
        } catch (error) {
            throw error;
        }
    }

    async requeteForCode(code: string): Promise<any> {
      const requestData = new URLSearchParams();
      secret: process.env.JWT_SECRET as string
      requestData.append('client_id', process.env.CLIENT_ID as string);
      requestData.append('client_secret', process.env.CLIENT_SECRET as string);
      requestData.append('code', code);
      requestData.append('redirect_uri', 'http://localhost:3000/api42/callback');
      requestData.append('grant_type', 'authorization_code');

      try {
        const response = await axios.post('https://api.intra.42.fr/oauth/token', requestData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });

        ApiService.accessToken = response.data.access_token;

        return response.data;
      } catch (error) {
        throw error;
      }
    }

    async getProfileWithAccessToken(accessToken: string): Promise<any> {
      const profileUrl = 'https://api.intra.42.fr/v2/me';

      try {
        const response = await axios.get(profileUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        return response.data;
      } catch (error) {
        console.error('Error getting profile:', error);
        throw new Error('Failed to get profile');
      }
    }

    async create(login: string, email: string, image: any){
      // hash password
      console.log(image.link);
      const urlImageb = image.link;
      await this.prisma.user.create({
        data: {
          name: login,
          email: email,
          password:'',
          img: urlImageb,
        }
      });
    }

    async  findByEmailApi(email: string){
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new NotFoundException('user with email ${email} not found');
      }

      return user;
    }

    async  findByEmailApitest(email: string){
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return null;
      }

      return user;
    }

    static creatAuthenticationToken42(userId: number) : string {
      return ApiService.jwtService.sign({
        userId,
      },
      {
        secret: process.env.JWT_SECRET as string
      }

      );
    }

    static getAccessToken(): string {
      return ApiService.accessToken;
  }
}

