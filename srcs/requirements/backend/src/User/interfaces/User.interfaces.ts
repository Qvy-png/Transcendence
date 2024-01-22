/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   User.interfaces.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: aptive <aptive@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/06/28 17:17:21 by aptive            #+#    #+#             */
/*   Updated: 2023/08/22 16:06:52 by aptive           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export type Status = 'ONLINE' | 'OFFLINE' | 'INGAME' | 'BUSY' ;

export interface User {
	id: number;
	email: string;
	password: string;
	name: string | null;
	img: string | null;
	status: string | null;
	games: number | null;
	wins: number | null;
	looses: number | null;
	rank: number | null;
	friendList: number[];
	pendingRequest: number[];
}
