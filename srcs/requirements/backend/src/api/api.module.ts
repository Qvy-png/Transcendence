/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   api.module.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: aptive <aptive@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/08/25 15:31:27 by aptive            #+#    #+#             */
/*   Updated: 2023/08/25 15:31:28 by aptive           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';

@Module({
  controllers: [ApiController],
  providers: [ApiService]
})
export class ApiModule {}
