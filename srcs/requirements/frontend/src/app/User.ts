type status = 'ONLINE' | 'OFFLINE';

export interface UserLog {
    id?: number;
    name: string;
    email: string;
    password: string;    
}

export interface UserInfo {
    games: number;
    rank: number;
    wins: number;
    looses: number;
    img: string;
    status: status;
    history: historic[];
}

export interface historic {
    gameId: number;
    winner: string; //User.name
    firstPlayer: User;
    secondPlayer: User;
    scorePlayerOne: number;
    scorePlayerTwo: number;
    date: Date;
    mode: boolean;
}

export interface User {
    id: number;
    name: string;
    email: string;
    img?: string;
}