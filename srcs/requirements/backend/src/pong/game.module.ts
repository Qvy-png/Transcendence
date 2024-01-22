import {
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
  } from '@nestjs/websockets';
import { log } from 'console';
import { timeout } from 'rxjs';
  import { Server, Socket } from 'socket.io';
  
  @WebSocketGateway(3001, { cors: { origin: '*' } })
  export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server: Server;
	rooms: { [key: string]: string[] } = {};  // Liste des utilisateurs par salle
	private queue: { username: string, socketId: string }[] = [];

	handleConnection(client: Socket) {
	  console.log(`Client connecté game: ${client.id}`);
	}
  
	handleDisconnect(client: Socket) {
	  console.log(`Client déconnecté: ${client.id}`);
	}

	@SubscribeMessage('leaveQueue')
async handleleaveQueue(client: Socket) {
  const index = this.queue.findIndex(player => player.socketId === client.id);
  if (index !== -1) {
    this.queue.splice(index, 1);
	console.log('disconnect queue', client.id);
  }
}

	@SubscribeMessage('joinQueue')
async handleJoinQueue(client: Socket, payload: { username }) {
  const username = payload.username;
  console.log("loli", payload.username);
  const socketId = client.id;
  this.queue.push({ username, socketId });
  console.log('join queue', client.id);
  this.tryStartGame();
}

tryStartGame() {
	if (this.queue.length >= 2) {
	  var player1 = this.queue.shift();
	  var player2 = this.queue.shift();
	  const socketId = player2.socketId;// retire le premier joueur
	  const username = player2.username; 
	  console.log(player2.username) // retire le deuxième joueur
	  const room = this.generateRoomId();

	  if ((player1 && player2)  && (player1.username != player2.username )) 
	  {
		this.server.to(player1.socketId).emit('joinRoom', room);
		this.server.to(player2.socketId).emit('joinRoom', room);
	  } 
	  else {
			this.queue.push({ username: username, socketId: socketId });
		}
	}
}

generateRoomId(): string {
    // Générez un ID unique pour la room. Utilisez un nombre aléatoire pour simplifier
    return Math.random().toString(36).substring(7);
  }
  
	@SubscribeMessage('joinRoom')
	joinRoom(client: Socket, payload: { room: string, username: string }) {
	console.log('join room', client.id);

	if (!this.rooms[payload.room]) {
		this.rooms[payload.room] = [];
	}
	if (this.rooms[payload.room] && this.rooms[payload.room].length >= 2) {
		this.server.to(client.id).emit('roomFull', `Room ${payload.room} is full.`);
		return;
	}
	  if (!this.rooms[payload.room].includes(payload.username) ) {
		this.rooms[payload.room].push(payload.username);
	}
  		client.join(payload.room);
		this.server.to(payload.room).emit('updateUserList', this.rooms[payload.room]);
	}

	@SubscribeMessage('checkRoom')
	async checkRoom(client: Socket, payload: { room: string }) {
	  const room = payload.room;
	  const usersInRoom = this.rooms[room];

	  if (usersInRoom) {
	    // Room exists
	    if (usersInRoom.length >= 2) {
	      // Room is full
	      this.server.to(client.id).emit('roomStatus', { room, status: 'full' });
	    } else {
	      // Room exists but is not full
	      this.server.to(client.id).emit('roomStatus', { room, status: 'waiting' });
	    }
	  } else {
	    // Room does not exist
	    this.server.to(client.id).emit('roomStatus', { room, status: 'noRoom' });
	  }
	}

	
	@SubscribeMessage('startGame')
	async handleStartGame(client: Socket, payload: { room: string; gameMode: string }) {
		const { room, gameMode } = payload;
 		this.server.to(room).emit('startGame', { message: 'La partie peut commencer' });
}

	@SubscribeMessage('leaveRoom')
	leaveRoom(client: Socket, payload: { room: string, username: string }) {
		if (this.rooms) {
			if (!this.rooms[payload.room]) {
				return;
			}
		}
	  client.leave(payload.room);
	  if(this.rooms) {
	  this.rooms[payload.room] = this.rooms[payload.room].filter(user => user !== payload.username);
	} else {
		console.error('rooms est indéfini');
	}
	  this.server.to(payload.room).emit('updateUserList', this.rooms[payload.room]);
	  if (this.rooms[payload.room].length == 0) {
		this.rooms[payload.room] = null;
	  }
	}

	
  }
  