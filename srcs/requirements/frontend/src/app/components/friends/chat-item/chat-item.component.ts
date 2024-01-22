import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { User, Status } from 'src/app/User';
import { LogService } from 'src/app/services/log.service';
import { faSolarPanel, faCrown, faStar, faEnvelope, faSkullCrossbones, faVolumeMute, faArrowRightFromBracket, faScaleBalanced, faThumbsDown, faMagnifyingGlass, faGear, faRightLeft} from '@fortawesome/free-solid-svg-icons';
import { ConvMessage, Conversation, Message } from 'src/app/components/friends/friends.component';
import { first } from 'rxjs';
import { Router } from '@angular/router';


@Component({
  selector: 'app-chat-item',
  templateUrl: './chat-item.component.html',
  styleUrls: ['./chat-item.component.css']
})
export class ChatItemComponent implements OnInit, OnChanges {
    @Input() messages!: ConvMessage[];
    @Input() id!: number;
    @Input() name!: string;
    @Input() selectedConvId!: number; // -1 Si ami
    @Input() privMessages!: Message[];
    @Input() currentFriend!: number; // -1 Si group
    @Input() Group!: Conversation;
    @Input() isGroupChat!: boolean;
    @Input() curId!: number;
    @Input() curBlockList!: number[];

    adminNameList: string[] = [];
    partiNameList: string[] = [];

    messageinput: string = '';

    ctrlPanel: boolean = false;

    type: string = '';

    // GroupType: string = (this.currentFriend == -1) ? this.Group.convType : '' ;

    faPanel = faSolarPanel;
    faCrown = faCrown;
    faAdmin = faStar;
    faInvite = faEnvelope;
    faBan = faSkullCrossbones;
    faUnBan = faScaleBalanced;
    faPromote = faStar;
    faDemote = faThumbsDown;
    faKick = faArrowRightFromBracket;
    faMute = faVolumeMute;
    faGlass = faMagnifyingGlass;
    faType = faGear;
    faChange = faRightLeft;

    action: number = -1;
    target!: string;
    password!: string;
    targetId: number = -1;

    @Output() sendMessage: EventEmitter<string> = new EventEmitter();
    @Output() sendInvite: EventEmitter<{uid:number, convWithAct:number, userToAct: string, idToAct: number}> = new EventEmitter();
    @Output() sendBan: EventEmitter<{uid:number, convWithAct:number, userToAct: string, idToAct: number}> = new EventEmitter();
    @Output() sendUnban: EventEmitter<{uid:number, convWithAct:number, userToAct: string, idToAct: number}> = new EventEmitter();
    @Output() sendPromote: EventEmitter<{uid:number, convWithAct:number, userToAct: string, idToAct: number}> = new EventEmitter();
    @Output() sendDemote: EventEmitter<{uid:number, convWithAct:number, userToAct: string, idToAct: number}> = new EventEmitter();
    @Output() sendKick: EventEmitter<{uid:number, convWithAct:number, userToAct: string, idToAct: number}> = new EventEmitter();
    @Output() sendMute: EventEmitter<{uid:number, convWithAct:number, userToAct: string, idToAct: number, minutes: number}> = new EventEmitter();
    @Output() sendChangeConvType: EventEmitter<{uid:number, convWithAct:number, convType: string, newPassword: string}> = new EventEmitter();

    @Output() panelStyle: EventEmitter<boolean> = new EventEmitter();

    constructor(
      private router: Router,
    ) { }

    ngOnChanges(changes: SimpleChanges): void {
      // console.log('in Group: ' + this.isGroupChat);
      // console.log('friend=> ', changes['Group']);
      // console.log('group=> ',changes['selectedConvId']);
      this.adminNameList = [];
      this.partiNameList = [];
      if (this.selectedConvId != -1) {

        for (let i = 0; i < this.Group.adminList.length; i++) {
          let name = this.Group.adminMap.get(this.Group.adminList[i]);
          if (name && name != this.Group.ownerName) {
            this.adminNameList.push(name);
          }
        }
        
        for (let i = 0; i < this.Group.participants.length; i++) {
          let name = this.Group.participantMap.get(this.Group.participants[i]);
          if (name) {
            this.partiNameList.push(name);
          }
        }
        this.type = this.Group.convType;
        // console.log(this.partiNameList);
      }

      setTimeout(() => {
        if (this.ctrlPanel == true) {
          this.onPanel();
          console.log('withdraw control panel'); 
        }
      });
    }

    ngOnInit(): void {
      // console.log('INIT NEW CHAT ' + this.name);
      
      // console.log('f: ' + this.currentFriend + ' g: ' + this.selectedConvId);
      // if (this.selectedConvId != -1) {

      //   for (let i = 0; i < this.Group.adminList.length; i++) {
      //     let name = this.Group.adminMap.get(this.Group.adminList[i]);
      //     if (name && name != this.Group.ownerName) {
      //       this.adminNameList.push(name);
      //     }
      //   }
        
      //   for (let i = 0; i < this.Group.participants.length; i++) {
      //     let name = this.Group.participantMap.get(this.Group.participants[i]);
      //     if (name) {
      //       this.partiNameList.push(name);
      //     }
      //   }
      //   // console.log(this.partiNameList);
      // }
        
    }
     
    goProfile(user: string) {
      const entry = [...this.Group.participantMap.entries()].find(([key, value]) => value == user);
      
      if (entry) {
        const id = entry[0]
        console.log('navigate to profile of [' + id + ', ' + user + ']');
        this.router.navigate(['profile'], { queryParams: {id: id} });
      }
    }

    checkContent(content: string): boolean {
      console.log('start herreeeeee ' + content);
      if (content.length < '/invite '.length) {
        return (false);
      }

      let room = content.substring('/invite '.length);
      const firstWord = room.split(' ')[0];

      if (firstWord == '' || firstWord.length == 0) {
        // alert("No Room name given!");
        // console.log("console: No room name given!");
        return (false);
      }

      // Check if the input is alpha-numerical
      const alphaNumericalPattern = /^[a-zA-Z0-9]*$/;
      if (!alphaNumericalPattern.test(firstWord)) {
        // alert("Room name must be alphanumeric!");
        // console.log("console: Room name must be alphanumeric!");
        return (false);
      }

      // Check for length constraints
      if (firstWord.length < 4 || firstWord.length > 10) {
        // alert("Room name must be between 4 to 10 characters!");
        // console.log("console: Room name must be between 4 to 10 characters!");
        return (false);
      }

      return (true);
    }

    handleInviteClick( content: string ) { 

        console.log("content invite: " + content);

        const inviteMessage = content.trim().substring('/invite '.length).trim();
        const firstWord = inviteMessage.split(' ')[0];

        if (firstWord.length == 0) {
          console.log("No name specified");
        }
        else {
          this.router.navigate(['/play-menu'], { queryParams: { JoinRoom: firstWord } });
        }
    }

    handleCreateClick( content: string ) { 

      console.log("content create: " + content);

      const inviteMessage = content.trim().substring('/invite '.length).trim();
      const firstWord = inviteMessage.split(' ')[0];

      if (firstWord.length == 0) {
        console.log("No name specified");
      }
      else {
        this.router.navigate(['/play-menu'], { queryParams: { CreateRoom: firstWord } });
      }
      // firstWord correspond au nom du groupe de jeu
  }

    isAdmin(user: string): boolean {
      for (let name of this.Group.adminMap.values())
        if (name == user)
          return (true);
      return (false);
    }

    isAdminId(user: number): boolean {
      if (this.Group.adminList.indexOf(user) != -1)
        return (true);
      return (false);
    }

    changeAction(action: number) {
      this.target = '';
      this.action = action;
    }

    placeholder(): string {
      switch(this.action) {
        case 1:
          return ('INVITE');
        case 2:
          return ('BAN');
        case 3:
          return ('UNBAN');
        case 4:
          return ('PROMOTE');
        case 5:
          return ('DEMOTE');
        case 6:
          return ('KICK');
        case 7:
          return ('MUTE');
      }
      return ('Enter name or id');
    }

    Send() {
      this.sendMessage.emit(this.messageinput);
      this.messageinput= '';
    }

    onPanel() {
      this.ctrlPanel = !this.ctrlPanel;
      // console.log(this.ctrlPanel);
      this.panelStyle.emit(this.ctrlPanel);
    }

    sendAction() {
      let isId: boolean = false; //Verify if target is a Name or an Id

      // console.log('action => '+ this.action);
      
      // console.log('pass => ' + this.Group.password);
      console.log(this.Group);
      
      if (this.action == 0 && this.target == this.Group.convType && this.password == this.Group.password) {
        alert('Similar Type or Password');
        return ;
      }

      if (this.action == -1) {
        alert('Please specify action');
        this.action = -1;
        this.target = '';
        return ;
      }

      if (!this.target) {
        alert('Please specify target');
        this.action = -1;
        this.target = '';
        return ;
      }

      if (this.target == 'protected' && !this.password) {
        alert('Please enter a Password');
        this.target = '';
        this.password = '';
        return ;
      }

      let tar = Number(this.target); // Convert target to Number type if an Id is specified
      // console.log(tar);
      if (!isNaN(tar)) {
        isId = true;
      }
      if (isId) {
        this.targetId = tar;
        this.target = '';
      }
      else {
        this.targetId = -1;
      }

      console.log(this.action);

      /*  ----------- */

      switch(this.action) {
        case 0:
          this.sendChangeConvType.emit({uid :this.id, convWithAct:this.selectedConvId, convType: this.target, newPassword: this.password});
          break;
        case 1:
          this.sendInvite.emit({uid :this.id, convWithAct:this.selectedConvId, userToAct: this.target, idToAct: this.targetId});
          break;
        case 2:
          this.sendBan.emit({uid :this.id, convWithAct:this.selectedConvId, userToAct: this.target, idToAct: this.targetId});
          break;
        case 3:
          this.sendUnban.emit({uid :this.id, convWithAct:this.selectedConvId, userToAct: this.target, idToAct: this.targetId});
          break;
        case 4:
          this.sendPromote.emit({uid :this.id, convWithAct:this.selectedConvId, userToAct: this.target, idToAct: this.targetId});
          break;
        case 5:
          this.sendDemote.emit({uid :this.id, convWithAct:this.selectedConvId, userToAct: this.target, idToAct: this.targetId});
          break;
        case 6:
          this.sendKick.emit({uid :this.id, convWithAct:this.selectedConvId, userToAct: this.target, idToAct: this.targetId});
          break;
        case 7:
          this.sendMute.emit({uid :this.id, convWithAct:this.selectedConvId, userToAct: this.target, idToAct: this.targetId, minutes: 1})
          break;
      }

      /*  ----------- */

      this.action = -1;
      this.target = '';
      this.targetId = -1;
    }

  }
