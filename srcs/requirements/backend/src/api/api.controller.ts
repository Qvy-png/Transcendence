/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   api.controller.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: aptive <aptive@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/08/25 15:31:24 by aptive            #+#    #+#             */
/*   Updated: 2023/08/27 16:13:00 by aptive           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Controller , Get, Query, Redirect} from '@nestjs/common';
import { ApiService } from './api.service';

@Controller('api42')
export class ApiController {

  constructor(private readonly ApiService: ApiService) {}


    @Get('callback')
    @Redirect('/api42/redirect-path-after-auth', 302) // Remplace par le chemin de redirection souhaité
    async handleAuthorizationCallback(@Query('code') code: string) {
      // Échange le code temporaire contre un access token
      console.log('code : ', code);
      // await this.ApiService.exchangeAuthorizationCodeForToken(code);

      try {
        const accessTokenResponse = await this.ApiService.exchangeAuthorizationCodeForToken(code);
        console.log('Access token received:', accessTokenResponse.access_token);

        // Ici tu peux stocker l'access token dans la session ou dans une base de données si nécessaire

        // Redirige vers le chemin spécifié après l'authentification réussie
      } catch (error) {
        console.error('Error exchanging code for access token:', error);
        // Gère l'erreur comme tu le souhaites
      }


    }

    @Get('/redirect-path-after-auth') // Assure-toi que le chemin correspond
    redirectToAfterAuth() {
      return "Authentification réussie !"; // Affiche un message simple
    }

    // Redirige vers le chemin spécifié après l'authentification réussie

//   @Get()
//   async getDataFromExternalApi(): Promise<any> {
//     try {
//       const data = await this.ApiService.fetchDataFromExternalApi();
//       return data;
//     } catch (error) {
//       // Gérer les erreurs ici
//       throw error;
//     }
//   }
}


