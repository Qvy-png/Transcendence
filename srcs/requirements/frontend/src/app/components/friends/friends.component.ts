import { filter } from 'rxjs';

//class to store messages locally
export class Message {
  senderId: number = -1;
  senderName: string = '';
  recipientId: number = -1;
  content: string = '';
  timeStamp: string = '';
}

//class to store conversations messages locally

export class ConvMessage {
  senderId: number = -1;
  senderName: string = '';
  convId: number = -1;
  content: string = '';
  timeStamp: string = '';
}

//class to store all the conversations that are received from sendConvSearch

export class Conversation {
  convId: number = -1;
  /** Public (Default) | Protected (Pass) | Private (Inv) */
  convType: string = 'public';
  convName: string = '';
  ownerId: number = -1;
  ownerName: string = '';
  adminMap: Map<number, string> = new Map(); // ATTENTION: L'ID EST LA KEY
  adminList: number[] = [];
  participantMap: Map<number, string> = new Map();
  participants: number[] = [];
  bannedUsers: number[] = [];
  isIn: boolean = false;
  password: string = '';
}

