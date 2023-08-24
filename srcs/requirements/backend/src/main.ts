/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   main.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: aptive <aptive@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/06/28 16:45:43 by aptive            #+#    #+#             */
/*   Updated: 2023/06/29 01:02:17 by aptive           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { LoggingInterceptor } from './loggin/loggin.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  await app.listen(3000);
}
bootstrap();
