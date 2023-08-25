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

export interface Info {
    id:             number;
    email:          string;
    password:       string;
    name:           string;
    img:            string;
    status:         string;
    games:          number;
    wins:           number;
    looses:         number;
    rank:           number;
    historicGameID: number[];
  }
  
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