
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from '../User/User.service';
import { UpdateUserDto } from '../User/dto/update_User.dto';
import { HistoricService } from 'src/historic/historic.service';
import { CreateHistoricGameDto } from 'src/historic/dto/create-historic.dto';

interface PongState {
  ball: { x: number, y: number, dx: number, dy: number };
  paddle1: { y: number };
  paddle2: { y: number };
  score1: number;
  score2: number;
}

interface Room {
  id: string;
  players: { username: string; socketId: string }[];
  gameState: PongState;
  interval: NodeJS.Timeout | null;
  rolesAssigned: boolean;
  paddleAssignment: Record<string, string>;
  paddleAssignments: Record<string, string>;
  gameMode : string;
}

@WebSocketGateway(3001, { cors: { origin: '*' } })
export class PongGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly userService: UserService, private readonly historicService: HistoricService) {}


  rooms: Record<string, Room> = {};

  initializeGameState(): PongState {
    // Generate a random number and use it to decide if dx and dy should be 3 or -3
    const dx = Math.random() < 0.5 ? -3 : 3;
    const dy = Math.random() < 0.5 ? -3 : 3;
  
    return {
      ball: { x: 300, y: 200, dx, dy },
      paddle1: { y: 150 },
      paddle2: { y: 150 },
      score1: 0,
      score2: 0,
    };
  }
  

@SubscribeMessage('joinRoom')
joinRoom(client: Socket, payload: { room: string; username: string }) {
  const { room, username } = payload;

  // Initialize room if it doesn't exist
  if (!this.rooms[room]) {
    this.rooms[room] = {
      id: room,
      players: [],
      gameState: this.initializeGameState(),
      interval: null,
      rolesAssigned: false,
      paddleAssignment: null,
      paddleAssignments: null,
      gameMode : "regular",
    };
    console.log(`User ${username} created room ${room}`);

  }

  // Add player to room if they are not already in it
  if (!this.rooms[room].players.some((player) => player.username === username)) {
    this.rooms[room].players.push({ username, socketId: client.id });
    client.join(room);
    console.log(`User ${username} joined room ${room}`);
  }
}

@SubscribeMessage('leaveRoom')
leaveRoom(client: Socket, payload: { room: string, username: string }) {
  const room = this.rooms[payload.room];
  
  if (room) {
    // Remove the user from the room
    room.players = room.players.filter(player => player.username !== payload.username);

    client.leave(payload.room);

    // Check if the room is now empty and delete it if so
    if (room.players.length === 0) {
      if (room.interval !== null) {
        clearInterval(room.interval);
      }
      delete this.rooms[payload.room];
      console.log(`Room ${payload.room} is empty. Deleting the in pong module.`);
    } else {
      console.log(`Room ${payload.room} called handle disconect`);
      if (room.paddleAssignments && room.paddleAssignments[client.id]) {
        if (room.interval !== null) {
          clearInterval(room.interval);

          // Identify the remaining player and announce them as the winner
          const remainingPlayerUsername = room.players[0].username;
          this.endGameAndDeleteRoom(room, `${remainingPlayerUsername} won`);
        }
      }
      // If the room is not empty, check for game status
      // Additional logic here if needed
    }
  } else {
    console.error(`Room ${payload.room} not found.`);
  }
}



moveBall(room: Room) {
  let { x, y, dx, dy } = room.gameState.ball;
  x += dx;
  y += dy;

  const ballSize = 10;  // Size of square ball
  const ballHalfSize = ballSize / 2;
  const paddleHeight = 100;

  if (y - ballHalfSize <= 0 || y + ballHalfSize >= 400) {
    dy = -dy;
  }

  const isWithinVerticalBounds = (ballY: number, paddleY: number) => (
    ballY + ballHalfSize >= paddleY && ballY - ballHalfSize <= paddleY + paddleHeight
  );

  // Check for collision with left paddle
  if (x - ballHalfSize <= 20 && isWithinVerticalBounds(y, room.gameState.paddle1.y)) {
    if (y - ballHalfSize <= room.gameState.paddle1.y || y + ballHalfSize >= room.gameState.paddle1.y + paddleHeight) {
      dy = -dy; // Bounce vertically
    } else {
      dx = -dx; // Bounce horizontally
      x = 20 + ballHalfSize;  // Adjust ball position to be just outside left paddle
    }
  }

  // Check for collision with right paddle
  if (x + ballHalfSize >= 580 && isWithinVerticalBounds(y, room.gameState.paddle2.y)) {
    if (y - ballHalfSize <= room.gameState.paddle2.y || y + ballHalfSize >= room.gameState.paddle2.y + paddleHeight) {
      dy = -dy; // Bounce vertically
    } else {
      dx = -dx; // Bounce horizontally
      x = 580 - ballHalfSize;  // Adjust ball position to be just outside right paddle
    }
  }

  if (x - ballHalfSize <= 0) {
    room.gameState.score2 += 1;
    x = 300;
    y = 200;
  }

  if (x + ballHalfSize >= 600) {
    room.gameState.score1 += 1;
    x = 300;
    y = 200;
  }

  room.gameState.ball = { x, y, dx, dy };
  //console.log('Ball moved:', room.gameState.ball);
}





@SubscribeMessage('startGame')
startGame(client: Socket, payload: { room: string; gameMode: string }) {
  const { room, gameMode } = payload;
  
  if (!this.rooms[room]) {
    console.error(`Room ${room} does not exist.`);
    return;
  }

  this.rooms[room].gameMode = gameMode;
  console.log(`Game mode for room ${room} set to ${gameMode}`);
}


  @SubscribeMessage('start')
start(client: Socket, payload: { message: string; username: string }) {
  const room = Object.values(this.rooms).find((r) =>
      r.players.some((player) => player.username === payload.username)
    );

    if (room && !room.rolesAssigned) {
      // Initialize paddleAssignment
      room.paddleAssignment = {};
      room.paddleAssignments = {};

      // Assign roles and update paddleAssignment
      room.rolesAssigned = true;
      room.players.forEach((player, index) => {
        const message = `${room.players[0].username} ${room.players[1].username}`;
        const paddleId = `paddle${index + 1}`;
        room.paddleAssignment[paddleId] = player.username;
        room.paddleAssignments[player.socketId] = `paddle${index + 1}`;
        this.server.to(player.socketId).emit('assignPlayer', paddleId);
        this.server.to(player.socketId).emit('players', message);
        console.log(`Assigned ${paddleId} to ${player.username}`);
      });

    // Start game
    if (room.interval === null)
      this.startGameLoop(room.id);
  }
}

@SubscribeMessage('move')
handleMove(client: Socket, payload: { paddle: string; y: number }) {
  let newY = payload.y;
  if (newY < 0) newY = 0;
  if (newY > 300) newY = 300;

  const room = Object.values(this.rooms).find((r) =>
    r.players.some((player) => player.socketId === client.id)
  );

  if (room) {
    const { players, gameState } = room;
    const player = players.find((p) => p.socketId === client.id);

    if (player) {
      const { username } = player;
      const { paddle } = payload;

      gameState[paddle].y = newY;

      // Update all players in the room
      players.forEach((player) => {
        this.server.to(player.socketId).emit('updateState', gameState);
      });
    }
  }
}

  handleConnection(client: Socket, ...args: any[]): any {
    console.log(`Client connected: ${client.id}`);
  }

  async updateDatabase(room: Room) {

    if (!room) return;

    // Determining the winner
    const winningPaddle = room.gameState.score1 > room.gameState.score2 ? 'paddle1' : 'paddle2';
    const winnerUsername = room.paddleAssignment[winningPaddle];

    // Constructing the result object
    const result = {
      roomId: room.id,
      player1: {
        username: room.paddleAssignment['paddle1'],
        score: room.gameState.score1
      },
      player2: {
        username: room.paddleAssignment['paddle2'],
        score: room.gameState.score2
      },
      winner: winnerUsername
    };

    for (const [paddleId, username] of Object.entries(room.paddleAssignment)) {
      const usersArray = await this.userService.findByName(username);

      if (usersArray && usersArray.length > 0) {
        const user = usersArray[0];

        const updateUserDto: UpdateUserDto = {
          status: 'ONLINE',
          games: (user.games || 0) + 1,
          wins: username === result.winner ? (user.wins || 0) + 1 : user.wins || 0,
          looses: username !== result.winner ? (user.looses || 0) + 1 : user.looses || 0,
          rank: username === result.winner ? (user.rank || 100) + 10 : (user.rank || 100) - 5
        };
        const createHistoricGameDto: CreateHistoricGameDto = {
          userId : user.id,
          opponentName: username === result.player1.username ? result.player2.username : result.player1.username,
          winner: result.winner,
          scorePlayerOne: username === result.player1.username ? result.player1.score : result.player2.score,
          scorePlayerTwo: username === result.player1.username ? result.player2.score : result.player1.score,
          
          date: new Date().toLocaleDateString(),
          mode: `${room.gameMode}`
        };

        await this.historicService.createHistoricGame(user.id, createHistoricGameDto);

        await this.userService.updateMyProfile(user, updateUserDto);
      }
    }
  }


  endGameAndDeleteRoom(room: Room, message: string): void {
    // Inform all players in the room about the game outcome
    room.players.forEach((player) => {
      this.server.to(player.socketId).emit('gameOutcome', message);
    });

    // Stop the game loop if it is running
    if (room.interval !== null) {
      clearInterval(room.interval);
    }
    this.updateDatabase(room);
    // Delete the room
    console.log(`Deleting room ${room.id}`);
    delete this.rooms[room.id];
  }

  startGameLoop(roomId: string): void {
    const room = this.rooms[roomId];
    if (!room) return;

    const hasGameEnded = (): boolean => {
      const { score1, score2 } = room.gameState;
      const diff = Math.abs(score1 - score2);
      
      switch (room.gameMode) {
        case 'deathmatch':
          return score1 === 1 || score2 === 1;
        case 'regular':
          return score1 === 3 || score2 === 3;
        case 'winby2':
          return (score1 >= 2 && diff >= 2) || (score2 >= 2 && diff >= 2);
        default:
          return false;
      }
    };

    const getWinningPaddle = (): string => {
      return room.gameState.score1 > room.gameState.score2 ? 'paddle1' : 'paddle2';
    };

    room.interval = setInterval(() => {
      this.moveBall(room);

      room.players.forEach((player) => {
        this.server.to(player.socketId).emit('updateState', room.gameState);
      });

      if (hasGameEnded()) {
        const winningPaddle = getWinningPaddle();
        const winnerUsername = room.paddleAssignment[winningPaddle];
        this.endGameAndDeleteRoom(room, `${winnerUsername}`);
        return;
      }

      //console.log('Updated game state');
    }, 40);
}


  handleDisconnect(client: Socket): any {
    console.log(`Pong Client disconnected: ${client.id}`);

    // Find which room the client was in
    let roomId: string | null = null;
    for (const [key, room] of Object.entries(this.rooms)) {
      if (room.players.some(player => player.socketId === client.id)) {
        roomId = key;
        break;
      }
    }

    if (roomId) {
      const room = this.rooms[roomId];

      // Remove the player from the room
      room.players = room.players.filter(
        player => player.socketId !== client.id
      );

      // If room is empty, delete the room
      if (room.players.length === 0) {
        if (room.interval !== null) {
          clearInterval(room.interval);
        }
        console.log(`Room ${roomId} is empty. Deleting the room.`);
        delete this.rooms[roomId];
      } else {
        if (room.paddleAssignments && room.paddleAssignments[client.id]) {
          if (room.interval !== null) {
            clearInterval(room.interval);

            // Identify the remaining player and announce them as the winner
            const remainingPlayerUsername = room.players[0].username;
            this.endGameAndDeleteRoom(room, `${remainingPlayerUsername} won`);
          }
        }
      }
    }
  }
}
