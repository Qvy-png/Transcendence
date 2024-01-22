/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   main.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: aptive <aptive@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/06/28 16:45:43 by aptive            #+#    #+#             */
/*   Updated: 2023/08/27 16:24:10 by aptive           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApiService } from './api/api.service';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { LoggingInterceptor } from './loggin/loggin.interceptor';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { NestExpressApplication } from '@nestjs/platform-express';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Transcendance API')
    .setVersion('0.1')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

    // Activer CORS avec des options personnalisées
    const corsOptions: CorsOptions = {
      origin: true, // ou spécifiez les origines autorisées ici, par exemple ['https://example.com']
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,UPDATE',
      preflightContinue: false,
      optionsSuccessStatus: 204,
    };
    app.enableCors(corsOptions)
    app.useGlobalInterceptors(new LoggingInterceptor());
    // console.log("__dirname", __dirname);
    // console.log(join(__dirname, '..', '..', 'src','profile-pictures'));
    // app.useStaticAssets(join('app', 'profile-pictures'));
    // Remplacez 'profile-pictures' par le chemin relatif de votre répertoire d'images


    await app.listen(3000);

    // test pour api42 ------------------------------------------------------------------------------------------
    try {
      const data = await ApiService.fetchDataFromExternalApi();
      console.log('--------------- Data from external API fetchDataFromExternalApi -----------------')
      console.log(data);
      // console.log('\n\n');
      // console.log('--------------- API code getAccessToken -----------------')
      // const data1 = await ApiService.sendAuthorizationRequest()
      // console.log(data1);
      // console.log('\n\n');
      // console.log('--------------- API accessToken exchangeAuthorizationCodeForToken -----------------')
      // const data2 = await ApiService.exchangeAuthorizationCodeForToken(data1);
      // console.log(data2);


    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }


bootstrap();
