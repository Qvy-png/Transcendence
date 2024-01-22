import { Component, DoCheck, OnInit } from '@angular/core';
import { faMagnifyingGlass, faUsersRays, faUsersBetweenLines, faUserPlus, faSkull } from '@fortawesome/free-solid-svg-icons';
import { LogService } from 'src/app/services/log.service';
import { UserInfoService } from 'src/app/services/user-info.service';
import { Infos } from 'src/app/User';
import { io, Socket } from 'socket.io-client';
import { ConvMessage, Conversation, Message } from './friends.component';
import { pipe, take } from 'rxjs';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent implements OnInit, DoCheck{
  
  curId!: number;
  name: string = '';
  block: string = '';
  group: string = '';

  faGlass = faMagnifyingGlass;
  faGroup = faUsersBetweenLines;
  faFriends = faUsersRays;
  faRequest = faUserPlus;
  faBlocked = faSkull;
  panelStyle: boolean = false;

  /** Pending Requests Array*/
  reqs: number[] = [];

  /** Friends Array*/
  friends: number[] = [];

  /** Blocked Users Array*/
  blocked: number[] = [];

  reqsList: boolean = true;
  frdsList: boolean = true;
  grpsList: boolean = false;
  blksList: boolean = false;

  //chat module
  convMessageTab: ConvMessage[] = [];
  storeConv: Conversation[] = [];
  adminMap: Map<number, string>[] = [];
  participantsMap: Map<number, string>[] = [];
  /** Meant to pass as input for chat group */
  selectedGroup!: Conversation;
  protectedPassword: string = '';
  messageTab: Message[] = [];
  messageinput: string = '';
  convWithAct:number = 0;
  /** Public (Default) | Protected (Pass) | Private (Inv) */
  convType: string = 'public';
  private socket: Socket;
  userToAct:string = '';
  convInput:string = '';
  message: string = '';
  idInput:number = -1;
  minutes:number = 0;
  convId:number = -1;
  sockID:string = '';
  umail:string = '';
  uname:string = '';
  conv:string = '';
  uid:number = 4;
  /**Gere le name du chat container*/
  convName: string = '';
  
  onChat:boolean = false;
  isGroupChat: boolean = false; // Permet a l'item de savoir si c'est un privChat ou un groupchat

  // groups: Conversation = {convId: 1, convType: 'public', convName: 'test', ownerId: 2, adminList: [1,2,6], participants: [1,2], bannedUsers: [], isIn: false};

  constructor(private logService: LogService, private userInfoService: UserInfoService) {
    this.socket = io('http://localhost:3002');
    this.initializeSocket(this.socket);  
  }

  ngDoCheck(): void {
    
  }

  async ngOnInit() {
    this.userInfoService.user$.pipe(take(1)).subscribe((user) => this.curId = user.id);
  
    this.userInfoService.loadUser(this.curId).pipe(take(1)).subscribe(() => {
      
      this.userInfoService.uInfo$.pipe(take(1)).subscribe((user) => {
        // console.log(user);

        this.reqs = user.pendingRequest;
        // this.reqs = [1, 2, 3,1,1,1,3,2];

        this.friends = user.friendList;
        // this.friends.push(1, 2);

        this.blocked = user.blockedUsers;
        // this.blocked = [4];
      });
    });

      //chat module
      try {
        await this.initializeSocket();
        
        this.userInfoService.user$.pipe(take(1)).subscribe((user) => { 
          this.uname = user.name;
          this.uid = user.id;
          this.umail = user.email;
        });
        
        this.socket.on('connect', () => {
          // console.log('Connected to server');
        });
        
        this.socket.on('displayMessage', (payload: any) => {
          // console.log('Received displayMessage event');
          this.message = payload.message1;
        });
        
        this.sendInfo();
        this.messageStorage();
        this.sendConvSearchResults();
        this.pansement();
      } catch (error) {
        // console.log('Error initializing socket',error);
      }
      //
  }

  showRequests() {
    this.reqsList = true;
    this.grpsList = false;
  }

  showFriends() {
    this.frdsList = true;
    this.blksList = false;
  }

  showGroups() {
    this.grpsList = true;
    this.reqsList = false;
    this.sendConvSearch(); //envoi des groupes au front lors de l'affichage de la liste des groupes
  }

  showBlocks() {
    this.blksList = true;
    this.frdsList = false;
  }
  
  deleteReq(req: number) {
    console.log('reqs before: ' + JSON.stringify(this.reqs));
    this.reqs = this.reqs.filter( (elem) => elem !== req );
    console.log('after: ' + JSON.stringify(this.reqs));
    
    let reqInfo = { pendingRequest: this.reqs };
    this.logService.updateUser(this.curId, reqInfo).pipe(take(1)).subscribe();
  }

  startChatFriend(event: any) { // {friendId: number, friendName: string}
    this.isGroupChat = false;
    this.onChat = true;
    this.convName = event.friendName;
    this.convWithAct = -1;
    this.messageinput="";
    this.idInput = event.friendId;
  }

  startChatGroup(event: any) { // event => { convId:number, convName:string }
    this.isGroupChat = true;
    this.convWithAct = event.convId;
    console.log(event.convId);
    this.idInput = -1;
    this.convName = event.convName;
    this.onChat  = true;

    for (let i = 0; i < this.storeConv.length; i++) { // Recup les infos du groupe chat actuel
      if (this.storeConv[i].convId == event.convId) {
        this.selectedGroup = this.storeConv[i];
        return ;
      }
    }

  }

  revokeFriend(friend: number) {
    console.log('revoke');
    
    // retire le current user de la list d'amis de la target
    this.logService.getUserById(friend).pipe(take(1)).subscribe( (value) => {
      let targetFriends = value.friendList;

      console.log('tarFriends before ' + JSON.stringify(targetFriends));
      targetFriends = targetFriends.filter( (elem) => elem !== this.curId );
      console.log('tarFriends after ' + JSON.stringify(targetFriends));

      let friendTarInfo = { friendList: targetFriends };
      this.logService.updateUser(friend, friendTarInfo).pipe(take(1)).subscribe();
    });

    // retire la target de la list d'amis de l'user
    console.log('friends before: ' + JSON.stringify(this.friends));
    this.friends = this.friends.filter( (elem) => elem !== friend );
    console.log('friends before: ' + JSON.stringify(this.friends));

    let friendInfo = { friendList: this.friends };
    this.logService.updateUser(this.curId, friendInfo).pipe(take(1)).subscribe();
    if (this.idInput == friend) {
      console.log('closing chat ' + this.idInput);
      this.onChat = false;
      this.socket.emit('unfriendBack', {unfriendId: friend, userId: this.curId});
    }
  }

  blockUser() {
    if (!this.block) { 
      alert('No name Given !');
      return ;
    }

    this.logService.getUserByName(this.block).pipe(take(1)).subscribe({
      next: (value) => {
        // Convertie la value en string JSON et se debarasse des []
        let objUser = JSON.stringify(value);
        
        // Trim la string pour ne plus avoir les [] qui empeche la conversion
        objUser = objUser.substring(1, objUser.length-1);
        // console.log(targetUser);

        // Convertie la string trimee en objet
        const targetUser: Infos = JSON.parse(objUser);
        // console.log(targetUser);

        if (!this.blockProtection(targetUser)) {
          return ;
        }

        // Ajoute l'id de la target dans l'array des blockes du cur User
        this.blocked.push(targetUser.id);
        console.log('new blocklist: ' + this.blocked);
        
        let blkInfo = { blockedUsers: this.blocked };

        this.logService.updateUser(this.curId, blkInfo).pipe(take(1)).subscribe(
          () => {
            console.log('target blocked');
            if (this.idInput == targetUser.id) {
              console.log('closing chat ' + this.idInput);
              this.onChat = false;
            }
            this.block = '';
          }
        );
      
      },
      error: () => {
        alert('User doensn\'t exist !');
        this.name = '';
      }
    });
  }

  blockFriend(formerFriend: string) {
    this.block = formerFriend;
    this.blockUser();
  }

  unBlockTarget(block: number) {
    // retire la target de la list des bloques
    this.blocked = this.blocked.filter( (elem) => elem !== block );
    console.log('blocked before: ' + JSON.stringify(this.blocked));

    let blkInfo = { blockedUsers: this.blocked };
    this.logService.updateUser(this.curId, blkInfo).pipe(take(1)).subscribe();
  }
      
  sendRequest() {
    if (!this.name) { 
      alert('No name Given !');
      return ;
    }
    console.log('request sent to: ' + this.name);
    
    this.logService.getUserByName(this.name).pipe(take(1)).subscribe({
      next: (value) => {
        // Convertie la value en string JSON et se debarasse des []
        let objUser = JSON.stringify(value);
        
        // Trim la string pour ne plus avoir les [] qui empeche la conversion
				objUser = objUser.substring(1, objUser.length-1);
				// console.log(targetUser);
        // -----------
        // Convertie la string trimee en objet targetUser
        const targetUser: Infos = JSON.parse(objUser);
        // console.log(targetUser);
        
        if (!this.friendReqProtection(targetUser)) {
          return ;
        }

        // Ajoute l'id du current User a l'array des reqs du target User
        targetUser.pendingRequest.push(this.curId);
        console.log(targetUser.pendingRequest);
        
        // Creation du JSON avec l'attribut a mettre a jour
        let reqInfo = { pendingRequest: targetUser.pendingRequest };

        console.log('adding req ' + JSON.stringify(reqInfo));
        
        this.logService.updateUser(targetUser.id, reqInfo).pipe(take(1)).subscribe(
          () => {
            console.log('request sent');
            this.name = '';
          }
        );

      },
      error: () => {
        alert('User doesn\'t exist !');
        this.name = '';
      }
    });
  }

  /** true => No issue | false => Can't send request*/
  friendReqProtection(target: Infos): boolean {
  // Check si la target n'est pas deja dans la liste des amis ni dans celles des requetes
  if (target.friendList) {
    let verif = target.friendList.indexOf(this.curId);
    // console.log('verif friendlist:' + verif);
    if (verif != -1) {
      alert('You are already friend !');
      this.name = '';
      return (false);
    }
  }

  if (target.blockedUsers) {  
    if (target.blockedUsers.indexOf(this.curId) != -1) {
      alert(target.name + ' has blocked you !');
      this.name = '';
      return (false);
    }
  }

  // Check si l'user a deja envoye une requete
  if (target.pendingRequest) {
    let verif = target.pendingRequest.indexOf(this.curId);
    // console.log('verif:' + verif);
    if (verif != -1) {
      alert('You have already sent a friend request !');
      this.name = '';
      return (false);
    }
  }

  // Check que la target n'a pas deja envoye une requete
  if (this.reqs.indexOf(target.id) != -1) {
    alert(target.name + ' has already sent you a request !');
    this.name = '';
    return (false);
  }

  // Check que la target n'a pas bloque l'user
  if (target.blockedUsers.indexOf(this.curId) != -1) {
    alert(target.name + ' has blocked you !');
    this.name = '';
    return (false);
  }

  let username;
  this.userInfoService.user$.pipe(take(1)).subscribe((user) => username = user.name);
  // console.log('name ' + username);
  if (username == target.name) {
    alert('You cannot befriend youserlf !');
    this.name = '';
    return (false);
  }

  return (true);
}

  blockProtection(target: Infos): boolean {
    // Check que la target n'est pas le current User
    let username;
    this.userInfoService.user$.pipe(take(1)).subscribe((user) => username = user.name);
    // console.log('name ' + username);
    if (username == target.name) {
      alert('You cannot block youserlf !');
      this.block = '';
      return (false);
    }

    // Check si la target n'est pas deja blocke
    if (this.blocked.indexOf(target.id) != -1) {
      alert(target.name + ' is already blocked !');
      this.block = '';
      return (false);
    }

    return (true);
  }

  //chat module
  async initializeSocket(socket?: Socket) {

    return new Promise<void>((resolve, reject) => {

      this.socket.on('connect', () => {
        // console.log('Connected to the server');
        //display the socket id of the client
        // console.log('My socket id is: ' + this.socket.id);
        this.sockID = this.socket.id;
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        // console.log('Connection Error:', error);
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        // console.log('Disconnected:', reason);
        reject(reason);
      });
    });
  }

  async messageStorage() {

    this.socket.on('storeMessages', (payload: any) => {
      // console.log('Received store Messages event');

      //clears the messageTab
      this.messageTab = [];
      this.convMessageTab = [];
      //store privMessages in messageTab
      for (let i = 0; i < payload.privMessages.length; i++) {
        this.messageTab.push({senderId: payload.privMessages[i].senderId, content: payload.privMessages[i].content, recipientId: payload.privMessages[i].recipientId, timeStamp: payload.privMessages[i].timeStamp, senderName: payload.privMessages[i].senderName});
      }
      // console.log(this.messageTab);
      //store convMessages in convMessageTab
      for (let i = 0; i < payload.convMessages.length; i++) {
        this.convMessageTab.push({senderId: payload.convMessages[i].senderId, content: payload.convMessages[i].content, timeStamp: payload.convMessages[i].timeStamp, convId: payload.convMessages[i].convId, senderName: payload.convMessages[i].senderName});
      }
      // console.log(this.convMessageTab);
      
      // console.log(payload.conversation);

    });
  }

  async sendConvSearchResults() {
    
    this.socket.on('storeConv', (payload: any) => {
      
      //put payload.serializedAdminMaps into an array of Map<number, string>

      for (let i = 0; i < payload.serializedAdminMaps.length; i++) {
        let map2: Map<number, string> = new Map();
        for (let j = 0; j < payload.serializedAdminMaps[i].length; j++) {
          map2.set(payload.serializedAdminMaps[i][j][0], payload.serializedAdminMaps[i][j][1]);
        }
        this.adminMap.push(map2);
      }

      //put payload.serializedParticipantMaps into an array of Map<number, string>

      for (let i = 0; i < payload.serializedParticipantMaps.length; i++) {
        let map2: Map<number, string> = new Map();
        for (let j = 0; j < payload.serializedParticipantMaps[i].length; j++) {
          map2.set(payload.serializedParticipantMaps[i][j][0], payload.serializedParticipantMaps[i][j][1]);
        }
        this.participantsMap.push(map2);
      }

      //using the class conversation to store the conversations received from sendConvSearch, in the variable storeConv
      // this.storeConv = [];
      let tester: Conversation[] = [];
      // this.storeConv.push(this.groups);
      for (let i = 0; i < payload.conversation.length; i++) {
        tester.push({convId: payload.conversation[i].convId,
                            convType: payload.conversation[i].convType,
                            convName: payload.conversation[i].convName,
                            password: payload.conversation[i].password,
                            ownerId: payload.conversation[i].ownerId,
                            ownerName: payload.conversation[i].ownerName,
                            adminList: payload.conversation[i].adminList,
                            adminMap: this.adminMap[i],
                            participants: payload.conversation[i].participants,
                            participantMap: this.participantsMap[i],
                            bannedUsers: payload.conversation[i].bannedUsers,
                            isIn: payload.conversation[i].isIn});
                            console.log(i);
      }
      this.storeConv = tester;
      // console.log('asdasd ' + this.storeConv.length);
    });
  }

  async pansement() {

    this.socket.on('kicked', (payload: any) => {

      this.sendConvSearch();
      this.onChat = false;
      alert('You have been kicked from the conversation ' + payload.convName);
    });  

    this.socket.on('banned', (payload: any) => {
          
      this.sendConvSearch();
      this.onChat = false;
      alert('You have been banned from the conversation ' + payload.convName);
    });

    this.socket.on('muted', (payload: any) => {
          
      this.sendConvSearch();
      this.onChat = false;
      alert('You have been muted from the conversation ' + payload.convName + ' for 1 minute');
    });

    this.socket.on('created', (payload: any) => {
          
      this.sendConvSearch();
      // this.onChat = false;
    });

    this.socket.on('leave', (payload: any) => {
          
      this.sendConvSearch();
      this.onChat = false;
    });

    this.socket.on('unfriend', (payload: any) => {
          
      this.sendConvSearch();
      alert('You have been unfriended');
      console.log(payload.user, this.idInput);
      if (payload.user == this.idInput) {
        this.onChat = false;
        this.friends = this.friends;
      }
    });

    this.socket.on('join', (payload: any) => {
          
      this.sendConvSearch();
      // this.onChat = false;
    });

    this.socket.on('promote', (payload: any) => {
          
      this.sendConvSearch();
      // this.onChat = false;
    });

    this.socket.on('demote', (payload: any) => {
          
      this.sendConvSearch();
      // this.onChat = false;
    });

    this.socket.on('wrongPwd', (payloard: any) => {
      alert('You are using the wront password');
      this.onChat = false;
      this.sendConvSearch();
    });

  }
  
  sendMessage(message: string) {
    // will send messages to groups or private convs depending on the status of the convWithAct and the idInput variables
    if (message[0]) {
      if (this.convWithAct == -1)
        this.socket.emit('requestMessage', {name:this.uname, message:message, userId:this.uid, recipientId: this.idInput});
      else if (this.idInput == -1)
        this.socket.emit('sendConv', {name:this.uname, userId:this.uid, content:message, convId:this.convWithAct});
    }
  }

  sendInfo() {
    // console.log('Sending sendInfo event');
    // this.socket.emit('sendInfo', {name:this.uname, message:this.messageinput, userId:this.uid, socket:this.client, text: 'Hello World!'});
    //emit on the socket the name, the uid, the socket, and a placeholder text saying Hello World!
    if (this.sockID)
      // console.log('My jerry id is: ' + this.sockID);
    this.socket.emit('sendInfo', {name:this.uname, userId:this.uid, socketId:this.sockID, mail:this.umail});
  }

  createConv() {

    console.log("hello: ", this.convType);
    if (!this.convInput) {
      alert('Group Name needed !');
      return ;
    } else if (this.convType == 'Protected' && !this.protectedPassword) {
      alert('Password needed for Protected Groups !');
      return ;
    }

    // console.log('Sending createConv event');
    this.socket.emit('createConv', {name:this.uname, userId:this.uid, content:this.convInput, convType: this.convType, password: this.protectedPassword});
    this.convWithAct = 0;
    this.convInput = '';
    this.protectedPassword = '';
    // delay(1000);
    // this.sendConvSearch();
    this.showGroups();
    // location.reload();
    
    }

  joinConv(event: any) { //convId:number, password:string, userId:number
    // this.onChat = true
    this.socket.emit('joinConv', {userId:event.userId, convId: event.convId, password: event.password});
    this.protectedPassword = '';
    // delay(1000);
    this.startChatGroup(event);
    this.sendConvSearch();
  }

  leaveConv(event:any) {
      // console.log('Sending leaveConv event');
      this.socket.emit('leaveConv', {userId:event.userId, convId:event.convId});
      this.onChat = false;
      // delay(1000);
      this.sendConvSearch();
      this.showGroups();
  }

  sendInvite(event: any) {
        
    // console.log('Sending sendInvite event');
    this.socket.emit('sendInvite', {userId:event.uid, convId:event.convWithAct, userToInvite:event.userToAct, idToInvite:event.idToAct});
    this.userToAct = '';
  }

  sendPromote(event:any) {
      
      // console.log("Promoting user: " + this.userToAct + " from the conversation" + this.convWithAct);
      this.socket.emit('sendPromote', {me:event.uid, userToPromote:event.userToAct, convId:event.convWithAct, idToPromote: event.idToAct}); 
      this.userToAct = '';
      // this.convWithAct = 0;
  }

  sendDemote(event:any) {

    // console.log("Demoting user: " + this.userToAct + " from the conversation" + this.convWithAct);
    this.socket.emit('sendDemote', {me:event.uid, userToDemote:event.userToAct, convId:event.convWithAct, idToDemote: event.idToAct});
    this.userToAct = '';
    // this.convWithAct = 0;
  }

  sendConv() {

    // console.log('Sending sendConv event');
    // this.socket.emit('sendConv', {name:this.uname, userId:this.uid, content:this.convInput, convId:this.convWithAct});
  }

  sendBan(event: any) {

    this.socket.emit('sendBan', {me:event.uid, userToBan:event.userToAct, convId:event.convWithAct, idToBan: event.idToAct});
    this.userToAct = '';
    // this.convWithAct = 0;
  }

  sendUnban(event: any) {

    console.log("Unbanning user: " + this.userToAct + " from the conversation" + this.convWithAct);
    this.socket.emit('sendUnban', {me:event.uid, userToUnban:event.userToAct, convId:event.convWithAct, idToUnban: event.idToAct});
    this.userToAct = '';
    // this.convWithAct = 0;
  }

  sendKick(event: any) {
      
      // console.log("Kicking user: " + this.userToAct + " from the conversation" + this.convWithAct);
      this.socket.emit('sendKick', {me:event.uid, userToKick:event.userToAct, convId:event.convWithAct, idToKick: event.idToAct});
      this.userToAct = '';
      // this.convWithAct = 0;
    }

  sendMute(event: any) {
      
    // console.log("Muting user: " + this.userToAct + " from the conversation" + this.convWithAct);
    this.socket.emit('sendMute', {me:event.uid, userToMute:event.userToAct, convId:event.convWithAct, time:event.minutes, idToMute: event.idToAct});
    this.userToAct = '';
    // this.convWithAct = 0;
  }

  sendConvSearch() {
      
    console.log("Searching for conversation:");
    this.socket.emit('sendConvSearch', {userId:this.uid});
  }

  sendChangeConvType(event:any) {
  
    console.log("Sending the change of convType " + event.newPassword);
    this.socket.emit('changeConvType', {userId:event.uid, convId:event.convWithAct, convType:event.convType, newPassword:event.newPassword});
    this.sendConvSearch();
  }

}
