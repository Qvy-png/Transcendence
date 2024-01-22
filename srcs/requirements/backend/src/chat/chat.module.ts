import { WebSocketGateway, SubscribeMessage, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { UserInfo, userInfo } from 'os';
import { Server } from 'socket.io';
import { UserController } from 'src/User/User.controller';
import { CurrentUser } from 'src/User/current-user.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
// import { CreateChatRoomDto, JoinRoomDto } from './dto/room-messages.dto';
import { hash, compare } from "bcryptjs"
import { User } from '@prisma/client';
import { subscribe } from 'diagnostics_channel';
import { Subscription, delay, elementAt, timestamp } from 'rxjs';
import { log, time } from 'console';
import { checkPrime } from 'crypto';
import e from 'express';
import { plainToClass } from 'class-transformer';
import { waitForDebugger } from 'inspector';

class UserSocket {
  name: string;
  id: number;
  socketId: string;
}

class PrivMessage {
  senderId: number;
  content: string;
  senderName: string;
  recipientId: number;
  timeStamp: string;
}

class ConvMessage {
  convId: number;
  senderId: number;
  senderName: string;
  content: string;
  timeStamp: string;
}

class MutedUser {
  userId: number;
  convId: number;
  mutedUntil: number;
}


@WebSocketGateway(3002, { cors: { origin: '*' } })
export class MessageSender implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;
  userSocket: UserSocket[] = [];
  PrivMessages: PrivMessage[] = [];
  convMessages: ConvMessage[] = [];
  mutedUsers: MutedUser[] = [];
  constructor(private readonly prisma : PrismaService) {}

  @SubscribeMessage('sendInfo')
  async handleConnection(client: any, payload: any,  ...args: any[]) {

    console.log(`Client connected: ${client.id}`);
    if (payload) {

      //adds the user to the userSocket array, if the user already exists, it updates the socketId
      const index = this.userSocket.findIndex((element) => element.id === payload.userId);
      if (index !== -1) {
        this.userSocket[index].socketId = client.id;
      }
      else {
        this.userSocket.push({name: payload.name, id: payload.userId, socketId: client.id});
      }
    }
    else
      console.log('payload is null');
    this.convMessageUpdater();
    console.log("all the messages are being sent");
  }

  //function that handles the disconnection of a user
  async handleDisconnect(client: any) {
    console.log(`Client disconnected: ${client.id}`);
    const index = this.userSocket.findIndex((element) => element.socketId === client.id);
    if (index !== -1) {
      this.userSocket.splice(index, 1);
    }
    console.log(this.userSocket);
  }

  //function that checks if the user exists in the database
  async isValidUser(userId: number): Promise<boolean> {
    console.log('Waiting for ' + userId + ' to give sign of life');
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (user)
      console.log('user found');
    else 
      console.log('user not found');
    return !!user;
  }

  //function to handle private messages using only the people online, with userSocket
  @SubscribeMessage('privateMessage')
  async handlePrivateMessage(client: any, payload: any ): Promise<void> {
    const isValidRecipient = await this.isValidUser(payload.recipientId);

    if (!isValidRecipient) {
      client.emit('privateMessageError', 'Recipient is not a valid user.');
      return;
    }

    //get information from the user with prisma

    const sender = await this.prisma.user.findUnique({
      where: {
        id: payload.senderId,
      },
    });

    //check if the sender if blocked by the user
    const userBlocked = sender.blockedUsers.find((element) => element === payload.recipientId);
    if (userBlocked) {
      client.emit('privateMessageError', 'You are blocked by this user.');
      console.log('You are blocked by this user.');
      return;
    }

    //check if the recipient is part of the user's friends list

    const userFriend = sender.friendList.find((element) => element === payload.recipientId);

    //if the user is not part of the friendList, return an error and say that this person is not your friend

    if (!userFriend) {
      client.emit('privateMessageError', 'This person is not your friend.');
      console.log('This person is not your friend.');
      return;
    }
    
    // envoi le mp
    const recipientSocketId = this.userSocket.find((element) => element.id === payload.recipientId);
    if (recipientSocketId) {

      console.log('Sending message to ' + recipientSocketId.socketId);
      console.log('Message content : ' + payload.content);
      this.server.to(recipientSocketId.socketId).emit('displayMessage', {message1: payload.content, senderId: payload.userId, timeStamp: payload.timeStamp});
      
      console.log('Message sent successfully.')
    }
    else {
      // Notifie si le message ne s'est pas correctement envoyé
      client.emit('privateMessageError', 'Recipient is currently offline.');
      console.log('Recipient is currently offline.');
    }

    //store in a temp variable, the name of the sender by doing a request on the database

    const senderName = await this.prisma.user.findUnique({
      where: {
        id: payload.senderId,
      },
    });

    // console.log(this.userSocket[].id);
    if (payload.flag === 1)
      this.PrivMessages.push({senderId: payload.senderId, recipientId: payload.recipientId, content: payload.content, timeStamp: payload.timeStamp, senderName: senderName.name}); // senderName: senderName.name
        // console.log(this.PrivMessages);
      this.convMessageUpdater();
    
      this.convMessageUpdater();

  }

  //messages coming from the front
  @SubscribeMessage('requestMessage')
  requestMessage(client: any, payload: any ): void {
    console.log(payload);
    this.handlePrivateMessage(client, { senderId: payload.userId, recipientId: payload.recipientId , content: payload.message, timeStamp:new Date(Date.now()).getTime().toString(), flag: 1 });
  }
  
  //function that handles the creation of a chatroom using the prisma service
  @SubscribeMessage('createConv')
  async handleCreateRoom(client: any, payload: any): Promise<void> {

    //check if the inputs are not empty strings
    console.log(payload.convType);

    if (payload.content === '' || payload.convType === '') {
      client.emit('createConvError', 'Inputs cannot be empty.');
      console.log('Inputs cannot be empty.');
      return;
    }

    //check if the content is not longer than 10 characters, and that the characters are alphanumeric

    if (payload.content.length > 10 || !/^[a-zA-Z0-9]+$/.test(payload.content)) {
      client.emit('createConvError', 'Conversation name must be alphanumeric and less than 10 characters.');
      console.log('Conversation name must be alphanumeric and less than 10 characters.');
      return;
    }

    //request to prisma to seek for existing rooms
    const room = await this.prisma.conversation.findFirst({
      where: {
        convName: payload.content,
      },
    });
    if (room) {
      client.emit('createConvError', 'Conversation already exists.');
      return;
    }
    //switch for all 3 cases of convType being either public, private or protected

    if (payload.convType === 'private') {
      //if the room doesn't exist, create it, auto increment for convId
      const newRoom = await this.prisma.conversation.create({
        data: {
          convType: payload.convType,
          convName: payload.content,
          ownerId: payload.userId,
          adminList: [payload.userId],
          imgURL: './assets/trace.svg',
          participants: [payload.userId],
          bannedUsers: [],
        },
      });
      //send a success message
      client.emit('createConvSuccess', 'Conversation created successfully.');
      console.log('Conversation created successfully.');

      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.userId,
        },
      });

      //if the user is already in the conversationList, return

      const userInConvList = user.conversationList.find((element) => element === newRoom.convId);

      if (userInConvList) {
        console.log('You are the user ' + payload.userId +' and you are already in conversationList');
        return;
      }

      //add the convId to the conversationList

      const temp2 = await this.prisma.user.update({
        where: {
          id: payload.userId,
        },
        data: {
          conversationList: [...user.conversationList, newRoom.convId],
        },
      });
      // this.handleJoinRoom(client, {convId: newRoom.convId, userId: payload.userId, password: payload.password});

    }
    else if (payload.convType === 'protected') {

      //check if the password is not empty

      if (payload.password === '') {
        console.log('Password cannot be empty.');
        return;
      }

      //hash the password before putting it in the database using bcryptjs

      const hashedPassword = await hash(payload.password, 10);

      //if the room doesn't exist, create it, auto increment for convId
      const newRoom = await this.prisma.conversation.create({
        data: {
          convType: payload.convType,
          convName: payload.content,
          ownerId: payload.userId,
          adminList: [payload.userId],
          imgURL: './assets/trace.svg',
          password: hashedPassword,
          participants: [payload.userId],
          bannedUsers: [],
        },
      });
      client.emit('createConvSuccess', 'Conversation created successfully.');
      console.log('Conversation created successfully.', newRoom.convId);

      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.userId,
        },
      });
      //if the user is already in the conversationList, return
      const userInConvList = user.conversationList.find((element) => element === newRoom.convId);
      if (userInConvList) {
        console.log('You are the user ' + payload.userId +' and you are already in conversationList');
        return;
      }
      //add the convId to the conversationList
      const temp2 = await this.prisma.user.update({
        where: {
          id: payload.userId,
        },
        data: {
          conversationList: [...user.conversationList, newRoom.convId],
        },
      });
      console.log("Je suis l'utilisateur " + user.id + "dans le protected");
      // this.handleJoinRoom(client, {convId: newRoom.convId, userId: payload.userId, password: payload.password});

    }
    else if (payload.convType === 'public'){
      //if the room doesn't exist, create it, auto increment for convId
      const newRoom = await this.prisma.conversation.create({
        data: {
          convType: payload.convType,
          convName: payload.content,
          ownerId: payload.userId,
          adminList: [payload.userId],
          imgURL: './assets/trace.svg',
          participants: [payload.userId],
          bannedUsers: [],
        },
      });
      //send a success message
      client.emit('createConvSuccess', 'Conversation created successfully.');
      console.log('Conversation created successfully.');

      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.userId,
        },
      });
      //if the user is already in the conversationList, return
      const userInConvList = user.conversationList.find((element) => element === newRoom.convId);
      if (userInConvList) {
        console.log('You are the user ' + payload.userId +' and you are already in conversationList');
        return;
      }
      //add the convId to the conversationList
      const temp2 = await this.prisma.user.update({
        where: {
          id: payload.userId,
        },
        data: {
          conversationList: [...user.conversationList, newRoom.convId],
        },
      });
      // this.handleJoinRoom(client, {convId: newRoom.convId, userId: payload.userId, password: payload.password});
    }
    else
      console.log('convType is not valid');
      console.log()
    // this.handleJoinRoom(client, {convId: payload.content, userId: payload.userId, password: payload.password});

    //find the socket of the user that created the group, using the userSocket list

    const socket = this.userSocket.find((element) => element.id === payload.userId);

    console.log(socket.socketId);

    //send to the user kicked a message that they have been kicked, through the websocket

    this.server.to(socket.socketId).emit('created', "haha");
  }

  //join a conversation using the prisma service

  @SubscribeMessage('joinConv')
  async handleJoinRoom(client: any, payload: any): Promise<void> {
  
    // Check if the conversation exists.
    console.log('You are the user ' + payload.userId + ' and you are trying to join the group ' + payload.convId )
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        convId: payload.convId,
      },
    });
  
    // If the conversation does not exist, send an error message.
    if (!conversation) {
      client.emit('joinConvError', 'Conversation does not exist.');
      return;
    }
    
    //check if the user is banned from the conversation
    const userBanned = conversation.bannedUsers.find((element) => element === payload.userId);
    if (userBanned) {
      client.emit('joinConvError', 'You are banned from this conversation.');
      console.log('You are banned from this conversation.');
      return;
    }
    
    
    //if the conversation is protected, check if the password is correct
    const convType = conversation.convType;
    if (convType === 'protected') {

      const validePassword = await compare(payload.password, conversation.password,);

      if (validePassword === false) {
        
        //find the socket of the user that got refused, using the userSocket list

        const socket = this.userSocket.find((element) => element.id === payload.userId);

        console.log(socket.socketId);

        //send to the user kicked a message that they have been kicked, through the websocket

        this.server.to(socket.socketId).emit('wrongPwd', "haha");
        return;
      }

    } else if (convType === 'private') { 
      console.log('Private conversation.');
      client.emit('joinConvError', 'Private conversation.');
      return;
    }


    //add to user the convId in the conversationList

    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
    });

    //if the user is already in the conversationList, return

    const userInConvList = user.conversationList.find((element) => element === payload.convId);

    // if (userInConvList) {
    //   console.log('You are the user ' + payload.userId +' and you are already in conversationList');
    //   return;
    // }

    //add the convId to the conversationList

    const temp2 = await this.prisma.user.update({
      where: {
        id: payload.userId,
      },
      data: {
        conversationList: [...user.conversationList, payload.convId],
      },
    });

    // if the pesron is already in the conversation, send an error message and return
    console.log(conversation.participants);
    const userInConv = conversation.participants.find((element) => element === payload.userId);
    if (userInConv) {
      console.log('You are the user ' + payload.userId +' and you are already in conversation');
      client.emit('joinConvError', 'You are already in this conversation.');
      return;
    }

    //add the user to the conversation found previously, to participants
    const temp = await this.prisma.conversation.update({
      where: {
        convId: conversation.convId,
      },
      data: {
        participants: [...conversation.participants, payload.userId],
      },
    });

    this.convMessageUpdater();

        //find the socket of the user that got kicked, using the userSocket list

        const socket = this.userSocket.find((element) => element.id === payload.userId);

        console.log(socket.socketId);
    
        //send to the user kicked a message that they have been kicked, through the websocket
    
        this.server.to(socket.socketId).emit('join', "haha");
  }

  //function that returns the user id of the user to invite

  async getUserIdFromName(payload:any ): Promise<number> {

    console.log(payload.userToTreat, payload.idToTreat);

    //check if the inputs are not undefined

    if (payload.userToTreat === undefined && payload.idToTreat === undefined) {
      console.log('Inputs cannot be undefined.');
      return -1;
    }

    if (payload.userToTreat === '')
      return payload.idToTreat;
    else
    {
      //get the ID of the user that is stored inside of payload.userToTreat

      const userToTreat = await this.prisma.user.findFirst({
        where: {
          name: payload.userToTreat,
        },
      });

      //if the user does not exist, send an error message

      if (!userToTreat) {
        console.log('This user does not exist.');
        return -1;
      }

      //if the user exists, get his ID
      console.log("I found the user ! ", userToTreat.id );
      return userToTreat.id;
    }
  }

  //function that invites a user to a private conversation using the prisma service

  @SubscribeMessage('sendInvite')
  async handleInvite(client: any, payload: any): Promise<void> {
    
    let finalIdToInvite: number;

    //check if the inputs are undefined or not 

    if (payload.userToInvite === undefined || payload.convId === undefined || payload.userId === undefined || payload.idToInvite === undefined) {
      client.emit('inviteError', 'Inputs cannot be undefined.');
      console.log('Inputs cannot be undefined.');
      return;
    }

    //check if the inputs are not empty strings 
    
    if (payload.convId === '' || payload.userId === '') {
      client.emit('inviteError', 'Inputs cannot be empty.');
      console.log('Inputs cannot be empty.');
      return;
    }

   //FinalIdToInvite gets the result of getUserIdFromName

    finalIdToInvite = await this.getUserIdFromName({userToTreat: payload.userToInvite, idToTreat: payload.idToInvite});

    if (finalIdToInvite === -1) {
      client.emit('inviteError', 'This user does not exist.');
      console.log('This user does not exist.');
      return;
    }

    // Check if the conversation exists.
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        convId: payload.convId,
      },
    });

    
    // If the conversation does not exist, send an error message.
    if (!conversation) {
      client.emit('inviteError', 'Conversation does not exist.');
      console.log('Conversation does not exist.');
      return;
    }
    
    
    //check if the conversation is private
    
    if (conversation.convType !== 'private') {
      client.emit('inviteError', 'This conversation is not private.');
      console.log('This conversation is not private.');
      return;
    }
    
    console.log("je suis une conversation privée");
    
    //check if the user is banned from the conversation
    const userBanned = conversation.bannedUsers.find((element) => element === finalIdToInvite);
    if (userBanned) {
      client.emit('joinConvError', 'You are banned from this conversation.');
      console.log('You are banned from this conversation.');
      return;
    }

    //check if the user to invite is already in the conversation

    const userInConv = conversation.participants.find((element) => element === finalIdToInvite);

    if (userInConv) {
      console.log('This user is already in this conversation.');
      return;
    }

    //check if the user asking for the invitation is part of the admins

    const userAdmin = conversation.adminList.find((element) => element === payload.userId);

    if (!userAdmin) {
      client.emit('inviteError', 'You are not an admin of this conversation.');
      console.log('You are not an admin of this conversation.');
      return;
    }

    //check if the user exists

    const userExist = await this.prisma.user.findUnique({
      where: {
        id: finalIdToInvite,
      },
    });

    if (!userExist) {
      client.emit('inviteError', 'This user does not exist.');
      console.log('This user does not exist.');
      return;
    }

    //invite the user

    const temp = await this.prisma.conversation.update({
      where: {
        convId: conversation.convId,
      },
      data: {
        participants: [...conversation.participants, finalIdToInvite],
      },
    });

    //add to user the convId in the conversationList

    const user = await this.prisma.user.findUnique({
      where: {
        id: finalIdToInvite,
      },
    });

    //if the user is already in the conversationList, return

    const userInConvList = user.conversationList.find((element) => element === payload.convId);

    if (userInConvList) {
      console.log('You are the user ' + payload.userId +' and you are already in conversationList');
      return;
    }

    //add the convId to the conversationList

    const temp2 = await this.prisma.user.update({
      where: {
        id: finalIdToInvite,
      },
      data: {
        conversationList: [...user.conversationList, payload.convId],
      },
    });

    console.log('User invited successfully.');
  }

  //leave a conversation using the prisma service

  @SubscribeMessage('leaveConv')
  async handleLeaveRoom(client: any, payload: any): Promise<void> {
  
    // Check if the conversation exists.
    console.log('You are the user ' + payload.userId + ' and you are trying to leave the group ' + payload.convId )
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        convId: payload.convId,
      },
    });
  
    // If the conversation does not exist, send an error message.
    if (!conversation) {
      client.emit('leaveConvError', 'Conversation does not exist.');
      console.log('Conversation does not exist.');
      return;
    }

    ///////

    //find the socket of the user that got kicked, using the userSocket list

    const socket = this.userSocket.find((element) => element.id === payload.userId);

    

    ///////
    //if the user is the owner of the conversation set the owner to the first admin in the admin list, and delete the owner from the admin list and the participants list
    if (conversation.ownerId === payload.userId) {
      console.log('owner leaving');
      //if there is no admin in the admin list, promote the first participant in the participants list to admin and as owner
      if (conversation.adminList.length === 1) {
        console.log('and no admin in the admin list');
        //if there is no participant in the participants list, delete the conversation
        if (conversation.participants.length === 1) {
          console.log("but no extra participant, so i'm deleting the conversation");
          const temp = await this.prisma.conversation.delete({
            where: {
              convId: conversation.convId,
            },
          });
          const user = await this.prisma.user.findUnique({
            where: {
              id: payload.userId,
            },
          });
          const userInConvList = user.conversationList.find((element) => element === payload.convId);
          if (!userInConvList) {
            console.log('You are the user ' + payload.userId +' and you are not in conversationList');
            return;
          }
          const temp2 = await this.prisma.user.update({
            where: {
              id: payload.userId,
            },
            data: {
              conversationList: user.conversationList.filter((element) => element !== payload.convId),
            },
          });
          this.server.to(socket.socketId).emit('leave', "haha");
          return;
        }
        //if there is a participant in the participants list, promote the first participant in the participants list to admin and as owner
        else {
          console.log("there's an extra participant, so i'm promoting him to admin and owner");
          console.log(conversation.participants[1] + ' is the new owner');
          const temp = await this.prisma.conversation.update({
            where: {
              convId: conversation.convId,
            },
            data: {
              ownerId: conversation.participants[1],
              adminList:  [conversation.participants[1]],
              participants: conversation.participants.filter((element) => element !== conversation.participants[0]),
            },  
          });
          const user = await this.prisma.user.findUnique({
            where: {
              id: payload.userId,
            },
          });
          const userInConvList = user.conversationList.find((element) => element === payload.convId);
          if (!userInConvList) {
            console.log('You are the user ' + payload.userId +' and you are not in conversationList');
            return;
          }
          const temp2 = await this.prisma.user.update({
            where: {
              id: payload.userId,
            },
            data: {
              conversationList: user.conversationList.filter((element) => element !== payload.convId),
            },
          });
          this.server.to(socket.socketId).emit('leave', "haha");
          return;
        }
      }
      //if there is an admin in the admin list, set the owner to the first admin in the admin list
      else {
        //first delete the owner from the admin list
        console.log('and there is an admin in the admin list');
        const temp = await this.prisma.conversation.update({
          where: {
            convId: conversation.convId,
          },
          data: {
            ownerId: conversation.adminList[1],
            adminList: conversation.adminList.filter((element) => element !== conversation.adminList[0]),
            participants: conversation.participants.filter((element) => element !== payload.userId),
          },
        });
        const user = await this.prisma.user.findUnique({
          where: {
            id: payload.userId,
          },
        });
        const userInConvList = user.conversationList.find((element) => element === payload.convId);
        if (!userInConvList) {
          console.log('You are the user ' + payload.userId +' and you are not in conversationList');
          return;
        }
        const temp2 = await this.prisma.user.update({
          where: {
            id: payload.userId,
          },
          data: {
            conversationList: user.conversationList.filter((element) => element !== payload.convId),
          },
        });
        this.server.to(socket.socketId).emit('leave', "haha");
        return;
      }
    }

    // if the person is not in the conversation, send an error message and return
    console.log(conversation.participants);
    const userInConv = conversation.participants.find((element) => element === payload.userId);
    if (!userInConv) {
      console.log('You are the user ' + payload.userId +' and you are not in conversation');
      client.emit('leaveConvError', 'You are not in this conversation.');
      return;
    }

    //remove the user from the conversation found previously, from participants
    const temp = await this.prisma.conversation.update({
      where: {
        convId: conversation.convId,
      },
      data: {
        participants: conversation.participants.filter((element) => element !== payload.userId),
      },
    });
    //not working
    console.log("going through here 4");
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
    });
    const userInConvList = user.conversationList.find((element) => element === payload.convId);
    if (!userInConvList) {
      console.log('You are the user ' + payload.userId +' and you are not in conversationList');
      return;
    }
    const temp2 = await this.prisma.user.update({
      where: {
        id: payload.userId,
      },
      data: {
        conversationList: user.conversationList.filter((element) => element !== payload.convId),
      },
    });
    return;
  }

  //promote a user to admin using the prisma service

  @SubscribeMessage('sendPromote')
  async handlePromote(client: any, payload: any): Promise<void> {


    //check if the inputs are not undefined

    if (payload.userToPromote === undefined || payload.convId === undefined || payload.me === undefined || payload.idToPromote === undefined) {
      client.emit('promoteError', 'Inputs cannot be undefined.');
      console.log('Inputs cannot be undefined.');
      return;
    }

    //check if the inputs are not empty strings

    if (payload.me === '' || payload.convId === '') {
      client.emit('promoteError', 'Inputs cannot be empty.');
      console.log('Inputs cannot be empty.');
      return;
    }

    // Check if the conversation exists.
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        convId: payload.convId,
      },
    });

    // If the conversation does not exist, send an error message.
    if (!conversation) {
      client.emit('promoteError', 'Conversation does not exist.');
      console.log('Conversation does not exist.');
      return;
    }

    let finalIdToPromote: number = await this.getUserIdFromName({userToTreat: payload.userToPromote, idToTreat: payload.idToPromote});

    if (finalIdToPromote === -1) {
      client.emit('banConvError', 'This user does not exist.');
      console.log('This user does not exist.');
      return;
    }


    //check if the user is already admin of the conversation

    const userAdmin = conversation.adminList.find((element) => element === finalIdToPromote);

    if (userAdmin) {
      client.emit('promoteError', 'This user is already an admin of this conversation.');
      console.log('This user is already an admin of this conversation.');
      return;
    }

    //check if the user asking for the promotion is part of the admins

    const userAdmin2 = conversation.adminList.find((element) => element === payload.me);

    if (!userAdmin2) {
      client.emit('promoteError', 'You are not an admin of this conversation.');
      console.log('You are not an admin of this conversation.');
      return;
    }

    //check if the user is in the conversation

    const userInConv = conversation.participants.find((element) => element === finalIdToPromote);

    if (!userInConv) {
      client.emit('promoteError', 'This user is not in this conversation.');
      console.log('This user is not in this conversation.');
      return;
    }
    
    //promote the user
    
    const temp = await this.prisma.conversation.update({
      where: {
        convId: conversation.convId,
      },
      data: {
        adminList: [...conversation.adminList, finalIdToPromote],
      },
    });


    //find the socket of the user that got kicked, using the userSocket list

    const socket = this.userSocket.find((element) => element.id === finalIdToPromote);

    console.log(socket.socketId);

    //send to the user kicked a message that they have been kicked, through the websocket

    this.server.to(socket.socketId).emit('promote', "haha");

  }
  
  //fonction that demotes an admin
  
  @SubscribeMessage('sendDemote')
  async handleDemote(client: any, payload: any): Promise<void> {
  
      //check if the inputs are not undefined

      if (payload.userToDemote === undefined || payload.convId === undefined || payload.me === undefined || payload.idToDemote === undefined) {
        client.emit('demoteError', 'Inputs cannot be undefined.');
        console.log('Inputs cannot be undefined.');
        return;
      }

      //check if the inputs are not empty strings
  
      if (payload.me === '' || payload.convId === '') {
        client.emit('demoteError', 'Inputs cannot be empty.');
        console.log('Inputs cannot be empty.');
        return;
      }
  
      // Check if the conversation exists.

      const conversation = await this.prisma.conversation.findFirst({
        where: {
          convId: payload.convId,
        },
      });

      // If the conversation does not exist, send an error message.

      if (!conversation) {
        client.emit('demoteError', 'Conversation does not exist.');
        console.log('Conversation does not exist.');
        return;
      }

      let finalIdToDemote: number = await this.getUserIdFromName({userToTreat: payload.userToDemote, idToTreat: payload.idToDemote});

      if (finalIdToDemote === -1) {
        client.emit('banConvError', 'This user does not exist.');
        console.log('This user does not exist.');
        return;
      }

      //check if the user is already admin of the conversation

      const userAdmin = conversation.adminList.find((element) => element === finalIdToDemote);

      if (!userAdmin) {
        client.emit('demoteError', 'This user is not an admin of this conversation.');
        console.log('This user is not an admin of this conversation.');
        return;
      }

      //check if the user to demote is the owner, if yes, cancel the demote

      if (conversation.ownerId === finalIdToDemote) {
        client.emit('demoteError', 'You cannot demote the owner of the conversation.');
        console.log('You cannot demote the owner of the conversation.');
        return;
      }

      //check if the user asking for the demotion is part of the admins

      const userAdmin2 = conversation.adminList.find((element) => element === payload.me);

      if (!userAdmin2) {
        client.emit('demoteError', 'You are not an admin of this conversation.');
        console.log('You are not an admin of this conversation.');
        return;
      }

      //demote the user

      const temp = await this.prisma.conversation.update({
        where: {
          convId: conversation.convId,
        },
        data: {
          adminList: conversation.adminList.filter((element) => element !== finalIdToDemote),
        },
      });

      //find the socket of the user that got kicked, using the userSocket list

      const socket = this.userSocket.find((element) => element.id === finalIdToDemote);

      console.log(socket.socketId);
  
      //send to the user kicked a message that they have been kicked, through the websocket
  
      this.server.to(socket.socketId).emit('promote', "haha");
    }

  //ban a user from a conversation using the prisma service
  @SubscribeMessage('sendBan')
  async handleBanConv(client: any, payload: any): Promise<void> {

    console.log(payload.userToBan, payload.idToBan, payload.convId, payload.me);

    //check if all the inputs are not undefined\

    if (payload.userToBan === undefined || payload.idToBan === undefined || payload.convId === undefined || payload.me === undefined) {
      client.emit('banConvError', 'Inputs cannot be undefined.');
      console.log('Inputs cannot be undefined.');
      return;
    }

    //check if the inputs are not empty strings

    if (payload.convId === '' || payload.me === '') {
      client.emit('banConvError', 'Inputs cannot be empty.');
      console.log('Inputs cannot be empty.');
      return;
    }

    // Check if the conversation exists.
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        convId: payload.convId,
      },
    });

    // If the conversation does not exist, send an error message.
    if (!conversation) {
      client.emit('banConvError', 'Conversation does not exist.');
      console.log('Conversation does not exist.');
      return;
    }

    let finalIdToBan: number = await this.getUserIdFromName({userToTreat: payload.userToBan, idToTreat: payload.idToBan});

    if (finalIdToBan === -1) {
      client.emit('banConvError', 'This user does not exist.');
      console.log('This user does not exist.');
      return;
    }

    //check if the user to ban is the owner of the conversation, if yes, cancel the ban
    if (conversation.ownerId === finalIdToBan) {
      client.emit('banConvError', 'You cannot ban the owner of the conversation.');
      console.log('You cannot ban the owner of the conversation.');
      return;
    }

   //check if the user asking for the ban is part of the admins

    const userAdmin = conversation.adminList.find((element) => element === payload.me);

    if (!userAdmin) {
      client.emit('banConvError', 'You are not an admin of this conversation.');
      console.log('You are not an admin of this conversation.');
      return;
    }

    //check if the user is in the conversation
    const userInConv = conversation.participants.find((element) => element === finalIdToBan);
    if (!userInConv) {
      client.emit('banConvError', 'This user is not in this conversation.');
      console.log('This user is not in this conversation.');
      return;
    }

    //take off the person from the participants list, admin list of they are in it, and add them to the banned users list
    const temp = await this.prisma.conversation.update({
      where: {
        convId: conversation.convId,
      },
      data: {
        participants: conversation.participants.filter((element) => element !== finalIdToBan),
        adminList: conversation.adminList.filter((element) => element !== finalIdToBan),
        bannedUsers: [...conversation.bannedUsers, finalIdToBan],
      },
    });
    console.log('User ' + finalIdToBan + ' has been banned from the conversation ' + payload.convId);

    //delete the conversation id from the banned user's conversation list

    const user = await this.prisma.user.findUnique({
      where: {
        id: finalIdToBan,
      },
    });

    //if the user is not in the conversationList, return

    const userInConvList = user.conversationList.find((element) => element === payload.convId);

    if (!userInConvList) {
      console.log('You are the user ' + payload.userId +' and you are not in conversationList');
      return;
    }

    //delete the convId from the conversationList

    const temp2 = await this.prisma.user.update({
      where: {
        id: finalIdToBan,
      },
      data: {
        conversationList: user.conversationList.filter((element) => element !== payload.convId),
      },
    });
    //if the user is muted in the conversation, delete them from the muted users list

    this.mutedUsers = this.mutedUsers.filter((element) => element.userId !== payload.userToKick && element.convId !== payload.convId);
  
    //find the socket of the user that got kicked, using the userSocket list

    const socket = this.userSocket.find((element) => element.id === finalIdToBan);

    console.log(socket.socketId);

    //send to the user kicked a message that they have been kicked, through the websocket

    this.server.to(socket.socketId).emit('banned', {convName: conversation.convName, convId: conversation.convId});
  }

  //unban a user from a conversation using the prisma service
  @SubscribeMessage('sendUnban')
  async handleUnbanConv(client: any, payload: any): Promise<void> {

    //check if the inputs are not undefined

    if (payload.userToUnban === undefined || payload.convId === undefined || payload.me === undefined) {
      client.emit('unbanConvError', 'Inputs cannot be undefined.');
      console.log('Inputs cannot be undefined.');
      return;
    }

    //check if the inputs are not empty

    if (payload.convId === '' || payload.me === ''){
      client.emit('unbanConvError', 'Inputs cannot be empty.');
      console.log('Inputs cannot be empty.');
      return;
    }

    // Check if the conversation exists.
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        convId: payload.convId,
      },
    });

    // If the conversation does not exist, send an error message.
    if (!conversation) {
      client.emit('unbanConvError', 'Conversation does not exist.');
      console.log('Conversation does not exist.');
      return;
    }

    let finalIdToUnban: number = await this.getUserIdFromName({userToTreat: payload.userToUnban, idToTreat: payload.idToBan});

    if (finalIdToUnban === -1) {
      client.emit('banConvError', 'This user does not exist.');
      console.log('This user does not exist.');
      return;
    }

    //check if the user is in the conversation

    const userInConv = conversation.bannedUsers.find((element) => element === finalIdToUnban);

    if (!userInConv) {
      client.emit('unbanConvError', 'This user is not banned from this conversation.');
      console.log('This user is not banned from this conversation.');
      return;
    }

    //check if the user asking for the unban is part of the admins

    const userAdmin = conversation.adminList.find((element) => element === payload.me);

    if (!userAdmin) {
      client.emit('unbanConvError', 'You are not an admin of this conversation.');
      console.log('You are not an admin of this conversation.');
      return;
    }

    //unban the user

    console.log(payload.convId);
    console.log(finalIdToUnban)
    const temp = await this.prisma.conversation.update({
      where: {
        convId: conversation.convId,
      },
      data: {
        bannedUsers: conversation.bannedUsers.filter((element) => element !== finalIdToUnban),
      },
    });
    console.log("User unbanned from the conversation");
  }

  //function to kick a user from a conversation using the prisma service
  @SubscribeMessage('sendKick')
  async handleKick(client: any, payload: any): Promise<void> {

    //check if the inputs are not undefined

    if (payload.userToKick === undefined || payload.convId === undefined || payload.me === undefined || payload.idToKick === undefined) {
      client.emit('kickError', 'Inputs cannot be undefined.');
      console.log('Inputs cannot be undefined.');
      return;
    }

    //check if the inputs are not empty

    if (payload.me === '' || payload.convId === '') {
      client.emit('kickError', 'Inputs cannot be empty.');
      console.log('Inputs cannot be empty.');
      return;
    }

    // Check if the conversation exists.

    const conversation = await this.prisma.conversation.findFirst({
      where: {
        convId: payload.convId,
      },
    });

    // If the conversation does not exist, send an error message.

    if (!conversation) {
      client.emit('kickError', 'Conversation does not exist.');
      console.log('Conversation does not exist.');
      return;
    }

    let finalIdToKick: number = await this.getUserIdFromName({userToTreat: payload.userToKick, idToTreat: payload.idToKick});

    if (finalIdToKick === -1) {
      client.emit('banConvError', 'This user does not exist.');
      console.log('This user does not exist.');
      return;
    }

    //check if the user to kick is the owner of the conversation, if yes, cancel the kick

    if (conversation.ownerId === finalIdToKick) {
      client.emit('kickError', 'You cannot kick the owner of the conversation.');
      console.log('You cannot kick the owner of the conversation.');
      return;
    }

    //check if the user asking for the kick is part of the admins

    const userAdmin = conversation.adminList.find((element) => element === payload.me);

    if (!userAdmin) {
      client.emit('kickError', 'You are not an admin of this conversation.');
      console.log('You are not an admin of this conversation.');
      return;
    }

    //check if the user is in the conversation

    const userInConv = conversation.participants.find((element) => element === finalIdToKick);

    if (!userInConv) {
      client.emit('kickError', 'This user is not in this conversation.');
      console.log('This user is not in this conversation.');
      return;
    }

    //kick the user, and remove from the admin list if the user is admin

    const temp = await this.prisma.conversation.update({
      where: {
        convId: conversation.convId,
      },
      data: {
        participants: conversation.participants.filter((element) => element !== finalIdToKick),
        adminList: conversation.adminList.filter((element) => element !== finalIdToKick),
      },
    });

    //delete the conversation id from the kicked user's conversation list

    const user = await this.prisma.user.findUnique({
      where: {
        id: finalIdToKick,
      },
    });

    //if the user is not in the conversationList, return

    const userInConvList = user.conversationList.find((element) => element === payload.convId);

    if (!userInConvList) {
      console.log('You are the user ' + payload.userId +' and you are not in conversationList');
      return;
    }

    //delete the convId from the conversationList

    const temp2 = await this.prisma.user.update({
      where: {
        id: finalIdToKick,
      },
      data: {
        conversationList: user.conversationList.filter((element) => element !== payload.convId),
      },
    });

    //if the user is muted in the conversation, delete them from the muted users list

    this.mutedUsers = this.mutedUsers.filter((element) => element.userId !== payload.userToKick && element.convId !== payload.convId);

    //get from finalIdToKick the ID of the user that got kicked, through the prisma service

    const userKicked = await this.prisma.user.findUnique({
      where: {
        id: finalIdToKick,
      },
    });

    //if the user does not exist, return

    if (!userKicked) {
      console.log('This user does not exist.');
      return;
    }

    //find the socket of the user that got kicked, using the userSocket list

    const socket = this.userSocket.find((element) => element.id === finalIdToKick);

    console.log(socket.socketId);

    //send to the user kicked a message that they have been kicked, through the websocket

    this.server.to(socket.socketId).emit('kicked', {convName: conversation.convName, convId: conversation.convId});
  }

//function that searches for people in the conversation using the prisma service, and sends hey to every participants
  @SubscribeMessage('sendConv')
  async handleSendConv(client: any, payload: any): Promise<void> {
  
    //check for the inputs

    if (payload.convId === '' || payload.content === '') {
      client.emit('searchConvError', 'Inputs cannot be empty.');
      console.log('Inputs cannot be empty.');
      return;
    }

    console.log('User ' + payload.userId + ' sending "' + payload.content + '" to group ' + payload.convId );

    //check in the prisma service if the user sending the message is in the conversation
    
    const userSender = await this.prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
    });

    //if the user is not in the conversation, send an error message and return

    const userInConv = userSender.conversationList.find((element) => element === payload.convId);

    if (!userInConv) {
      client.emit('searchConvError', 'You are not in this conversation.');
      console.log('You are not in this conversation.');
      return;
    }

    // Check if the conversation exists.
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        convId: payload.convId,
      },
    });
    
    // If the conversation does not exist, send an error message.
    if (!conversation) {
      console.log('Conversation does not exist.');
      return;
    }

    //check if the person writing the message is muted in the conversation
  
    console.log(this.mutedUsers);
    if (this.mutedUsers.length >= 0) {
      const userMuted = this.mutedUsers.find((element) => element.userId === payload.userId && element.convId === payload.convId);
      if (userMuted !== undefined) {
        if (userMuted.mutedUntil > Number(new Date(Date.now()).getTime().toString())) {
          console.log('You are muted in this conversation.');
          return;
        }
        else { //if the person is not muted anymore, delete them from the muted users list
          this.mutedUsers = this.mutedUsers.filter((element) => element.userId !== payload.userId && element.convId !== payload.convId);
        }
      }
    }

    //get in a variable named tmp, the name of the user that sent the message, using the prisma service

    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
    });

    // Add the conversation to the list of conversations. set timestamp as the number of ms since 1970

    this.convMessages.push({
      convId: conversation.convId,
      senderId: payload.userId,
      content: payload.content,
      timeStamp: new Date(Date.now()).getTime().toString(),
      senderName: user.name,
    });

    // console.log(this.convMessages);
    this.convMessageUpdater();
  }

  //function that sends to the client that requests, a list of the public and protected conversations available
 
  @SubscribeMessage('sendConvSearch')
  async handleSendConvSearch(client: any, payload: any): Promise<void> {

    //find the conversation in which the user is in

   // Separate the queries to avoid referencing variables before declaration
    const userPromise = this.prisma.user.findUnique({ where: { id: payload.userId } });
    const convInfoPromise = userPromise.then(user => 
      this.prisma.conversation.findMany({
        where: {
          convId: {
            in: user?.conversationList,
          },
        },
      })
    );

    const user = await userPromise;
    const convInfo = await convInfoPromise;

  for (let i = 0; i < convInfo.length; i++)
      console.log(convInfo[i].password);
    // console.log(convInfo.length);

    // convInfo.forEach((element) => delete element.password);

    const fetchedConv = convInfo.map((element) => {
      return {
        convId: element.convId,
        convType: element.convType,
        convName: element.convName,
        ownerId: element.ownerId,
        ownerName: '',
        adminList: element.adminList,
        adminMap: new Map<number, string>(),
        participants: element.participants,
        participantMap: new Map<number, string>(),
        bannedUsers: element.bannedUsers,
        isIn: true,
        password: element.password,
      };
    });

    //get all the public conversations

    const publicConv = await this.prisma.conversation.findMany({
      where: {
        convType: 'public',
      },
    });

    //get all the protected conversations

    const protectedConv = await this.prisma.conversation.findMany({
      where: {
        convType: 'protected',
      },
    });

    // protectedConv.forEach((element) => delete element.password);
    publicConv.push(...protectedConv);
    const restOfConv = publicConv.filter((element) => !fetchedConv.find((element2) => element2.convId === element.convId));

    // console.log(restOfConv);

    //add the conversations to the fetchedConv of the user

    fetchedConv.push(...restOfConv.map((element) => {
      return {
        convId: element.convId,
        convType: element.convType,
        convName: element.convName,
        ownerId: element.ownerId,
        ownerName: '',
        adminList: element.adminList,
        adminMap: new Map<number, string>(),
        participants: element.participants,
        participantMap: new Map<number, string>(),
        bannedUsers: element.bannedUsers,
        isIn: false,
        password: element.password,
      };
    }));

    //go through all the elements, and add a variable named ownerName, that would get the name of the owner of the conversation from the prisma service

    for (let i = 0; i < fetchedConv.length; i++) {
      const owner = await this.prisma.user.findUnique({
        where: {
          id: fetchedConv[i].ownerId,
        },
      });
      fetchedConv[i].ownerName = owner.name;
    }
    
    //ADMIN MAPS
    //makes a map<number, string> where you're going to go through all the adminLists, and add in the map the IDs from the admins, as well as their corresponding names

    const adminMap = new Map<number, string>();

    for (let i = 0; i < fetchedConv.length; i++) {
      for (let j = 0; j < fetchedConv[i].adminList.length; j++) {
        const admin = await this.prisma.user.findUnique({
          where: {
            id: fetchedConv[i].adminList[j],
          },
        });
        adminMap.set(fetchedConv[i].adminList[j], admin.name);
      }
      adminMap.forEach((value, key) => {
        fetchedConv[i].adminMap.set(key, value);
      });
      adminMap.clear();
    }

    // make an array of all the adminMaps from all the conversations stored in fetchedConv

    const adminMaps = fetchedConv.map((element) => element.adminMap);

    // serialize it so it can be passed in a websocket

    const adminMapsSerialized = adminMaps.map((element) => {
      return Array.from(element.entries());
    });
    //

    //PARTICIPANTS MAPS

    //makes a map<number, string> where you're going to go through all the participantsLists, and add in the map the IDs from the participants, as well as their corresponding names

    const participantMap = new Map<number, string>();

    for (let i = 0; i < fetchedConv.length; i++) {
      for (let j = 0; j < fetchedConv[i].participants.length; j++) {
        const participant = await this.prisma.user.findUnique({
          where: {
            id: fetchedConv[i].participants[j],
          },
        });
        participantMap.set(fetchedConv[i].participants[j], participant.name);
      }
      participantMap.forEach((value, key) => {
        fetchedConv[i].participantMap.set(key, value);
      });
      participantMap.clear();
    }

    // make an array of all the participantMaps from all the conversations stored in fetchedConv

    const participantMaps = fetchedConv.map((element) => element.participantMap);

    // serialize it so it can be passed in a websocket

    const participantMapsSerialized = participantMaps.map((element) => {
      return Array.from(element.entries());
    });
    
    console.log(fetchedConv);

    client.emit('storeConv', {conversation: fetchedConv, serializedAdminMaps: adminMapsSerialized, serializedParticipantMaps: participantMapsSerialized});

  }

  //function that mutes a user using the prisma service, for some defined amount of time
  @SubscribeMessage('sendMute')
  async handleMuteUser(client: any, payload: any): Promise<void> {

    console.log("Mute moi ça");

    //check if the inputs are not undefined

    if (payload.userToMute === undefined || payload.convId === undefined || payload.me === undefined || payload.time === undefined) {
      console.log('Inputs cannot be undefined.');
      return;
    }

    //check the inputs

    if (payload.me === '' || payload.convId === '') {
      console.log('Inputs cannot be empty.');
      return;
    }

    // Check if the conversation exists.

    const conversation = await this.prisma.conversation.findFirst({
      where: {
        convId: payload.convId,
      },
    });

    console.log(conversation);
    // If the conversation does not exist, send an error message.

    if (!conversation) {
      console.log('Conversation does not exist.');
      return;
    }

    let finalIdToMute: number = await this.getUserIdFromName({userToTreat: payload.userToMute, idToTreat: payload.idToMute});

    if (finalIdToMute === -1) {
      console.log('This user does not exist.');
      return;
    }

    //check if the user is in the conversation

    const userInConv = conversation.participants.find((element) => element === finalIdToMute);

    if (!userInConv) {
      console.log('This user is not in this conversation.');
      return;
    }

    //check if the user asking for the mute is part of the admins

    const userAdmin = conversation.adminList.find((element) => element === payload.me);

    if (!userAdmin) {
      console.log('You are not an admin of this conversation.');
      return;
    }

    //add the user to the muted users tab, and calculate the time their are gonna be muted from the number of minutes given for the mute and the current time

    this.mutedUsers.push({
      userId: finalIdToMute,
      convId: payload.convId,
      mutedUntil: Number(new Date(Date.now() + payload.time * 60000).getTime().toString()) , //lowered from payload.time to 1 so it stays muted for 1 minute instead of flexible time parce que FLEMME HEIN
    });
    console.log(this.mutedUsers);

    //find the socket of the user that got kicked, using the userSocket list

    const socket = this.userSocket.find((element) => element.id === finalIdToMute);

    console.log(socket.socketId);

    //send to the user kicked a message that they have been kicked, through the websocket

    this.server.to(socket.socketId).emit('muted', {convName: conversation.convName, convId: conversation.convId});
  }
  
  //function that handles sending all the messages in payloads to each clients
  async convMessageUpdater() {

    //take the list of all users in userSocket, and send to each of them the messages that are related to them, in an array
    for (let i = 0; i < this.userSocket.length; i++) {

      //take the list of all privmessages that have been sent and received
      const privMessages = this.PrivMessages.filter((element) => element.senderId === this.userSocket[i].id || element.recipientId === this.userSocket[i].id);

      const user = await this.prisma.user.findUnique({
        where: {
          id: this.userSocket[i].id,
        },
      });

      //get in convMessages all the messages from the conversations the user is in
      const convMessages = this.convMessages.filter((element) => user.conversationList.find((element2) => element2 === element.convId));

      if (this.userSocket[i].socketId) {
        this.server.to(this.userSocket[i].socketId).emit('storeMessages', {privMessages: privMessages, convMessages: convMessages});
      }
    }
  }

  //function that allows the conv Owner only to change the convType of a conversation
  @SubscribeMessage('changeConvType') //TODO ne pas oublier de l'intégrer
  async handleChangeConvType(client:any, payload: any): Promise<void> {
    
    // console.log(payload.convId, payload.userId, payload.convType, payload.newPassword);

    if (payload.convId === '' || payload.userId === '' || !payload.convId) {
      console.log('ChangeConvType inputs cannot be empty.');
      return;
    }

    const conversation = await this.prisma.conversation.findFirst({
      where: {
        convId: payload.convId,
      },
    });

    console.log(conversation.ownerId);

    if (conversation.ownerId !== payload.userId) {
      console.log('You are not the owner of this conversation.');
      return;
    }

    console.log("Je suis le owner visiblement !!");

    //check if the convType is valid

    if (payload.convType !== 'public' && payload.convType !== 'protected' && payload.convType !== 'private') {
      console.log('convType is not valid');
      return;
    }

    //if the convType is protected, check if the password is not empty

    if (payload.convType === 'protected' && payload.newPassword === '') {
      console.log('Password cannot be empty.');
      return;
    }

    //change the convType of the conversation in the database, depending on the convType given in the payload

    if (payload.convType === 'public') {
      const temp = await this.prisma.conversation.update({
        where: {
          convId: payload.convId,
        },
        data: {
          convType: 'public',
        },
      });
    }
    else if (payload.convType === 'protected') {
      console.log("je vais canner " + payload.newPassword);


      const hashedPassword = await hash(payload.newPassword, 10);

      const temp = await this.prisma.conversation.update({
        where: {
          convId: payload.convId,
        },
        data: {
          convType: 'protected',
          password: hashedPassword,
        },
      });
      console.log('new mdp: ' + temp.password);
      
    }
    else if (payload.convType === 'private') {
      const temp = await this.prisma.conversation.update({
        where: {
          convId: payload.convId,
        },
        data: {
          convType: 'private',
        },
      });
    }
  }
  @SubscribeMessage('unfriendBack')
  async handleUnfriendFrontUpdate(client:any, payload: any): Promise<void> {

    console.log("je suis le back et je recois le unfriend de " + payload.unfriendId + " et je suis " + payload.userId);
    console.log(this.userSocket);


    //find the socket of the user that got unfriend, using the userSocket list

    const socket = this.userSocket.find((element) => element.id === payload.unfriendId);

    console.log(socket.socketId);

    //send to the user unfriend a message that they have been kicked, through the websocket

    this.server.to(socket.socketId).emit('unfriend', {unfriendId: payload.unfriendId, user: payload.userId});
  }
}
