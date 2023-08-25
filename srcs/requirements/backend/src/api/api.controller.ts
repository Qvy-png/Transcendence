/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   api.controller.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: aptive <aptive@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/08/25 15:31:24 by aptive            #+#    #+#             */
/*   Updated: 2023/08/25 15:31:26 by aptive           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Controller , Get} from '@nestjs/common';
import { ApiService } from './api.service';

@Controller('api42')
export class ApiController {

  constructor(private readonly ApiService: ApiService) {}

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
