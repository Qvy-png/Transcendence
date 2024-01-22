import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { Infos } from 'src/app/User';
import { faCrown } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { UserInfoService } from 'src/app/services/user-info.service';

@Component({
  selector: 'app-ranker-item',
  templateUrl: './ranker-item.component.html',
  styleUrls: ['./ranker-item.component.css']
})
export class RankerItemComponent implements OnInit {

  @Input()  user!: Infos;

  icon!: any;

  name!: string;
  rank!: number;
  img?: string;
  imageSrc?: string;
  win!: number;
  lost!: number;

  constructor(private route: Router, private uInfoService: UserInfoService) {}

  goProfile() {
    console.log('navigate to profile');
    this.uInfoService.isBlocked(this.user.id).subscribe( (value) => {
      if (!value) {
        this.route.navigate(['profile'], { queryParams: {id: this.user.id} });
      }
    });
  }

  ngOnInit(): void {
    this.name = this.user.name;
    this.rank = this.user.rank;
    this.img = this.user.img;
    this.imageSrc = this.img;
    this.win = this.user.wins;
    this.lost = this.user.looses;
  }
}
