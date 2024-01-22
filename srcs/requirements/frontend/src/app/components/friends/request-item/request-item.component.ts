import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LogService } from 'src/app/services/log.service';
import { UserInfoService } from 'src/app/services/user-info.service';

@Component({
  selector: 'app-request-item',
  templateUrl: './request-item.component.html',
  styleUrls: ['./request-item.component.css']
})
export class RequestItemComponent implements OnInit {

  @Input() id!: number; //Id de la target
  name: string = '';
  img?: string = '';
  targetFriendlist: number[] = [];
  imageSrc!: string;

  curId!: number; //Id du current User
  myFriendlist: number[] = [];

  @Output() deleteRequest: EventEmitter<number> = new EventEmitter();

  constructor(private uInfoService: UserInfoService, private logService: LogService, private route: Router) {
  }

  goProfile() {
    console.log('navigate to profile');
    this.route.navigate(['profile'], { queryParams: {id: this.id} });
  }

  ngOnInit(): void {
    console.log('req item id: ' + this.id);
    
    this.uInfoService.uInfo$.subscribe(
      (uInfo) => {
        this.curId = uInfo.id;
        this.myFriendlist = uInfo.friendList;
      }
    );

    this.logService.getUserById(this.id).subscribe({
      next: (user) => {
        this.name = user.name;
        this.img = user.img;
        this.targetFriendlist = user.friendList;
        this.imageSrc = this.img;

      },
      error: (value) => {
        console.log('getUserById failed ' + value);
      }
    });
  }

  // Ajoute l'user de la requete dans la liste d'amis,
  accept() {
    // ajouter l'id dans la friendlist
    if (this.myFriendlist == undefined) {   
      this.myFriendlist = [this.id];
    } else {
      this.myFriendlist.push(this.id);
    }

    let curfriendlist = { friendList: this.myFriendlist};

    this.logService.updateUser(this.curId, curfriendlist).subscribe();

    // ajouter le current user dans la friendlist de la target
    if (this.targetFriendlist == undefined) {
      this.targetFriendlist = [this.curId];
    } else {
      this.targetFriendlist.push(this.curId);
    }

    let tarfriendlist = { friendList: this.targetFriendlist };

    this.logService.updateUser(this.id, tarfriendlist).subscribe();

    // emit pour retirer l'item
    this.deleteRequest.emit(this.id);
  }

  refuse() {
    // emit pour retirer l'item
    this.deleteRequest.emit(this.id);
  }

}
