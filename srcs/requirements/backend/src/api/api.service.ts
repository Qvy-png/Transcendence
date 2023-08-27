/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   api.service.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: aptive <aptive@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/08/25 15:31:30 by aptive            #+#    #+#             */
/*   Updated: 2023/08/27 16:37:50 by aptive           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ApiService {

    private static accessToken: string = ''; // Stocke l'access_token ici    static accessToken: any;

    static async fetchDataFromExternalApi(): Promise<any> {
        const requestData = `grant_type=client_credentials&client_id=u-s4t2ud-2c044f5e3d78865bec2a409a277aea2aafbbdc9b4452a820f1d3db8b06e8f80a&client_secret=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`;

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

//   static async sendAuthorizationRequest(): Promise<any> {
//     console.log("HEEEEEEEEEEEEEEEEEEEEEEEERE")
//     const authorizationUrl = 'https://api.intra.42.fr/oauth/authorize' +
//       '?client_id=u-s4t2ud-ee40ae9256c9e88990064bbb544ec0df2b7c25634f6ebfd0bd7be28783bc026b' +
//       '&redirect_uri=http://localhost:3000' +
//       '&response_type=code'
//     //   '&scope=public' +
//     //   '&state=a_very_long_random_string_witchmust_be_unguessable';
//     // b18430a2446a1ef4d462915e96323f4a6637f606998045186d67cc49497fac87
//     try {
//       const response = await axios.get(authorizationUrl);
//       console.log("reponse : ", response)
//       return response.data;
//     } catch (error) {
//       throw error;
//     }
//   }

//    async exchangeAuthorizationCodeForToken(code: string): Promise<any> {
//     console.log(code);
//     const requestData = {
//         grant_type: "authorization_code",
//         client_id: "u-s4t2ud-ee40ae9256c9e88990064bbb544ec0df2b7c25634f6ebfd0bd7be28783bc026b",
//         client_secret: "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",
//         redirect_uri: "http://localhost:3000",
//         code,
//     };

//     console.log('requestData : ', requestData);

//     // try {
//       const response = await axios.post("https://api.intra.42.fr/oauth/token", requestData, {
//         headers: { "Content-Type": "application/json" } });

//       // Stocke l'access_token dans le service
//       console.log('reponse : ', response.data.access_token);
//       ApiService.accessToken = response.data.access_token;

//       return response.data;
//     // } catch (error) {
//     //   throw error;
//     // }
//   }

//   static getAccessToken(): string {
//     return ApiService.accessToken; // Renvoie l'access_token stocké au niveau de la classe
//   }
// }

async exchangeAuthorizationCodeForToken(code: string): Promise<any> {
    const requestData = new URLSearchParams();
    requestData.append('client_id', 'u-s4t2ud-2c044f5e3d78865bec2a409a277aea2aafbbdc9b4452a820f1d3db8b06e8f80a');
    requestData.append('client_secret', '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');
    requestData.append('code', code);
    requestData.append('redirect_uri', 'http://localhost:3000/api42/callback');
    // requestData.append('state', 'qwertyuiop');
    requestData.append('grant_type', 'authorization_code');

    try {
      const response = await axios.post('https://api.intra.42.fr/oauth/token', requestData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${ApiService.getAccessToken()}`,
        },
      });

      ApiService.accessToken = response.data.access_token;

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static getAccessToken(): string {
    return ApiService.accessToken;
  }

//   static redirectToAfterAuth() {
//     throw new Error('Function not implemented.');
//   }
}

