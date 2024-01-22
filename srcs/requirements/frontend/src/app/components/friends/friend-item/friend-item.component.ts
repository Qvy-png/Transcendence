import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { User, Status } from 'src/app/User';
import { LogService } from 'src/app/services/log.service';
import { faGamepad, faSkullCrossbones, faUserSlash, faComment, faAddressCard } from '@fortawesome/free-solid-svg-icons';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-friend-item',
  templateUrl: './friend-item.component.html',
  styleUrls: ['./friend-item.component.css']
})
export class FriendItemComponent implements OnInit {
  
  @Input() id!: number;
  name: string = '';
  img?: string = '';
  imageSrc!: string;
  status!: Status;
  color!: string;
  game: boolean = false;
  faPad = faGamepad;
  faBlock = faSkullCrossbones;
  faRevok = faUserSlash;
  faTalk = faComment;
  faProfile = faAddressCard;
  showDetails: boolean = false;
  size: string = '45px';

  @Output() blockFriend: EventEmitter<string> = new EventEmitter();
  @Output() revokeFriend: EventEmitter<number> = new EventEmitter();
  @Output() chatFriend: EventEmitter<{friendId: number, friendName: string}> = new EventEmitter();

  isPlayMenu: boolean = false;

  constructor(private logService: LogService, private route: Router) {}
  
  onToggleAction() {
    this.showDetails = !this.showDetails;
    this.size = (this.showDetails) ? '90px' : '45px';
  }

  Block() {
    this.revokeFriend.emit(this.id);
    this.blockFriend.emit(this.name);
  }

  Revoke() {
    this.revokeFriend.emit(this.id);
  }
  
  Chat() {
    if (!this.isPlayMenu) {
      this.chatFriend.emit({friendId: this.id, friendName: this.name});
    } else {
      // SEND INVITATION
    }
  }

  goProfile() {
    console.log('navigate to profile');
    this.route.navigate(['profile'], { queryParams: {id: this.id} });
  }

  ngOnInit() {
    // console.log('friend item id: ' + this.id);
    
    if (this.route.url == "/play-menu") {
      this.isPlayMenu = true;
    }

    this.logService.getUserById(this.id).subscribe({
      next: (user) => {
        this.name = user.name;
        this.img = user.img;
        this.status = user.status;
        this.imageSrc = this.img;
        
        // console.log('friend [' + this.name + '] status is ' + this.status);
        switch(this.status) {
          case 'ONLINE':
            this.color = '#46C34B';
            break
          case 'INGAME':
              this.color = '#46C34B';
              this.game = true;
            break;
          case 'OFFLINE':
            this.color = '#6F6F6F';
            break;
          case 'BUSY':
            this.color = '#D75050';
            break;
          default:
            this.color = '#46C34B';
        }
      },
      error: (value) => {
        console.log('getUserById failed ' + value);
      }
    });

  }
}
