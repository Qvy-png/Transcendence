import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ApiService {

    private static accessToken: string = ''; // Stocke l'access_token ici    static accessToken: any;

    static async fetchDataFromExternalApi(): Promise<any> {
        const requestData = `grant_type=client_credentials&client_id=u-s4t2ud-ee40ae9256c9e88990064bbb544ec0df2b7c25634f6ebfd0bd7be28783bc026b&client_secret=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`;

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

  async sendAuthorizationRequest(): Promise<any> {
    const authorizationUrl = 'https://api.intra.42.fr/oauth/authorize' +
      '?client_id=u-s4t2ud-ee40ae9256c9e88990064bbb544ec0df2b7c25634f6ebfd0bd7be28783bc026b' +
      '&redirect_uri=http%3A%2F%2Flocalhost%3A4200' +
      '&response_type=code'
    //   '&scope=public' +
    //   '&state=a_very_long_random_string_witchmust_be_unguessable';
    // b18430a2446a1ef4d462915e96323f4a6637f606998045186d67cc49497fac87
    try {
      const response = await axios.get(authorizationUrl);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async exchangeAuthorizationCodeForToken(code: string): Promise<any> {
    console.log(code);
    // const requestData = new URLSearchParams();
    // requestData.append('grant_type', 'authorization_code');
    // requestData.append('client_id', 'u-s4t2ud-ee40ae9256c9e88990064bbb544ec0df2b7c25634f6ebfd0bd7be28783bc026b');
    // requestData.append('client_secret', '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');
    // requestData.append('code', 'b18430a2446a1ef4d462915e96323f4a6637f606998045186d67cc49497fac87');
    // requestData.append('redirect_uri', 'http://localhost:4200');

    const requestData = new URLSearchParams();
    requestData.append('grant_type', 'authorization_code');
    requestData.append('client_id', 'u-s4t2ud-ee40ae9256c9e88990064bbb544ec0df2b7c25634f6ebfd0bd7be28783bc026b');
    requestData.append('client_id', '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');
    requestData.append('code', code);
    requestData.append('redirect_uri', 'https://myawesomeweb.site/callback');

    try {
      const response = await axios.post('https://api.intra.42.fr/oauth/token', requestData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      // Stocke l'access_token dans le service
      ApiService.accessToken = response.data.access_token;

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static getAccessToken(): string {
    return ApiService.accessToken; // Renvoie l'access_token stocké au niveau de la classe
  }
}


