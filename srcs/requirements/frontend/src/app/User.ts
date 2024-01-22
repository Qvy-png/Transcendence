export type Status = 'ONLINE' | 'OFFLINE' | 'INGAME' | 'BUSY' ;

export interface UserLog {
    id?: number;
    name: string;
    email: string;
    password: string;
}

export interface UserInfo {
    id: number;
    games: number;
    rank: number;
    wins: number;
    looses: number;
    img: string;
    status: Status;
    historicGameID: number[];
    friendList: number[];
    pendingRequest: number[];
    blockedUsers: number[];
    twoFactor: boolean;
    twoFactorSecret: string;
    conversationList: number[];
}

// export interface historic {
//     gameId: number;
//     winner: string; //User.name
//     firstPlayer: User;
//     secondPlayer: User;
//     scorePlayerOne: number;
//     scorePlayerTwo: number;
//     date: Date;
//     mode: boolean;
// }

export interface User {
    id: number;
    name: string;
    email: string;
    img?: string;
}

export interface Info {
    profile: {
        id:                 number;
        email:              string;
        password:           string;
        name:               string;
        img:                string;
        status:             Status;
        games:              number;
        wins:               number;
        looses:             number;
        rank:               number;
        historicGameID:     number[];
        friendList:         number[];
        pendingRequest:     number[];
        blockedUsers:       number[];
        twoFactor:          boolean;
        twoFactorSecret:    string;
        conversationList:   number[];
    }
}

export interface Infos {
    id:                 number;
    email:              string;
    password:           string;
    name:               string;
    img:                string;
    status:             Status;
    games:              number;
    wins:               number;
    looses:             number;
    rank:               number;
    historicGameID:     number[];
    friendList:         number[];
    pendingRequest:     number[];
    blockedUsers:       number[];
    twoFactor:          boolean;
    twoFactorSecret:    string;
    conversationList:   number[];
}

export interface Historic {
    gameId:         number;
    userId:         string;
    opponentName:   string;
    winner:         string;
    scorePlayerOne: number;
    scorePlayerTwo: number;
    date:           string;
    mode:           string;
}

// {
// "profile": {
//     "id": 3,
//     "email": "t@t.fr",
//     "name": "chams",
//     "img": null,
//     "status": null,
//     "games": null,
//     "wins": null,
//     "looses": null,
//     "rank": null
// }
// }

//   model Historic {
//     gameId          Int      @default(autoincrement()) @id
//     userId          Int // relation scalar field  (used in the `@relation` attribute above)
//     opponentName    String?
//     winner          String?
//     scorePlayerOne  Int?
//     scorePlayerTwo  Int?
//     data            String?
//     mode            String?
//     user            User?    @relation(fields: [userId], references: [id])
//   }
