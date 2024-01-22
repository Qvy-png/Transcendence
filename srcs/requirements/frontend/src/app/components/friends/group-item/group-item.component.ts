import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {faArrowRightFromBracket, faComment, faArrowsToDot, faLock, faEyeLowVision } from '@fortawesome/free-solid-svg-icons';
import { Conversation } from '../friends.component';
import { TitleStrategy } from '@angular/router';
import { delay } from 'rxjs';

@Component({
  selector: 'app-group-item',
  templateUrl: './group-item.component.html',
  styleUrls: ['./group-item.component.css']
})
export class GroupItemComponent implements OnInit{

  @Input() group!: Conversation;
  @Input() currentUser!: number;
  @Input() pass: string = '';

  id!: number;
  type!: string;
  name!: string;
  ownerId!: number;
  adminList: number[] = [];
  participants: number[] = [];
  bannedUsers: number[] = [];
  isIn!: boolean;


  locked: boolean = false;

  showDetails: boolean = false;
  size: string = '45px';
  color: string = '#FFDE56';

  faJoin = faArrowsToDot;
  faTalk = faComment;
  faRevok = faArrowRightFromBracket;
  faLock = faLock;
  faPriv = faEyeLowVision;

  @Output() joinConv: EventEmitter<{convId:number, password:string, userId:number, convName:string}> = new EventEmitter();
  @Output() leaveConv: EventEmitter<{userId:number, convId:number}> = new EventEmitter();
  @Output() startChatGroup: EventEmitter<{convId:number, convName:string}> = new EventEmitter();
  @Output() sendConvSearch: EventEmitter<void> = new EventEmitter();

  constructor() {}

  onToggleAction() {
    this.showDetails = !this.showDetails;
    this.size = (this.showDetails) ? '90px' : '45px';
  }

  Open() {
    // console.log("open chat conv: " + this.id);
    this.startChatGroup.emit({convId: this.id, convName: this.name});
  }

  Leave() {
    console.log("leave conv: " + this.id);
    this.leaveConv.emit({userId: this.currentUser, convId: this.id});
  }

  join() {

    if (this.bannedUsers.indexOf(this.currentUser) != -1) {
      alert("You are banned from this group");
      return;
    }
      this.joinConv.emit({convId: this.id, password: this.pass, userId: this.currentUser, convName: this.name});
      
  }

  ngOnInit(): void {
    // console.log('init group item ' + this.group.convId + ' -> ' + this.group.convName);
    

    this.id = this.group.convId;
    this.type = this.group.convType;
    this.name = this.group.convName;
    this.ownerId = this.group.ownerId;
    this.adminList = this.group.adminList;
    // console.log(this.adminList);
    
    this.participants = this.group.participants;
    this.bannedUsers = this.group.bannedUsers;
    this.isIn = (this.participants.indexOf(this.currentUser) != -1) ? true : false;
    if (this.ownerId == this.currentUser || this.adminList.indexOf(this.currentUser) != -1) {
      this.color = '#FAEDB7';
    } else if (this.participants.indexOf(this.currentUser) != -1) {
      this.color = '#46C34B';
    } else {
      this.color = '#FFDE56';
    }

    // this.sendConvSearch.emit();
  }
}
