/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Historic.interfaces.ts                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: aptive <aptive@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/08/22 15:45:55 by aptive            #+#    #+#             */
/*   Updated: 2023/08/22 15:46:18 by aptive           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export interface Historic {
  gameId: number;
  winner: string | null;
  user: User | null;
  userId: number | null;
  scorePlayerOne: number | null;
  scorePlayerTwo: number | null;
  data: string | null;
  mode: string | null;
}


export interface User {
	id : number;
	email : string;
	name? : string;
	password : string;
}
