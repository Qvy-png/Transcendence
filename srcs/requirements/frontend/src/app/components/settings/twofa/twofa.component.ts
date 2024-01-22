import { Component, OnInit } from '@angular/core';
import { LogService } from 'src/app/services/log.service';
import { UserInfoService } from 'src/app/services/user-info.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-twofa',
  templateUrl: './twofa.component.html',
  styleUrls: ['./twofa.component.css']
})
export class TwofaComponent implements OnInit {

  curId!: number;

  userId!: number;
  twoFa: boolean = false;
  qrUrl: string = '';
  code: string = '';
  secret: string = '';
  auth_token!: string;

  constructor(private logService: LogService, private uInfoService: UserInfoService, private router: Router) {}

  verify2Fa() {
    if (!this.code) {
      alert('Enter 2Fa code');
      return ;
    }

    this.logService.verify2FAToken(this.curId, this.code).subscribe({
      next: (value) => {
        console.log(value);
        console.log("2Fa enabled");

        this.logService.enable2FA();
        this.twoFa = true;

        this.router.navigate(['settings']);

      },
      error: (value) => {
        console.log(value);
      }
    });

    this.code = '';
  }


  disable2Fa() {
    this.logService.disable2FAToken(this.curId, this.code).subscribe({
      next: (value) => {
        console.log(value);
        console.log("2Fa disabled");
        
        this.logService.disable2FA();
        this.twoFa = false;
        this.router.navigate(['settings']);
      },
      error: (value) => {
        console.log(value);
      }
    });
  }

  ngOnInit(): void {
    this.uInfoService.user$.subscribe((user) => this.curId = user.id);

    this.twoFa = this.logService.is2FA();
    console.log(this.twoFa + "  2fa");
    

    let token = this.uInfoService.getToken('id_token'); // id token a besoin d'un trim special pour etre utiliser
    if (token != '') {
      this.auth_token = this.uInfoService.trimToken(token);
    } else {
      this.auth_token = this.uInfoService.getToken('42_token');
    }

    if(!this.twoFa) {
      this.logService.get2Fa(this.auth_token).subscribe({
        next: (values) => {
          this.qrUrl = values.qrCodeURL;
          // console.log('qrCode: ' + values.qrCodeURL);
          this.secret = values.secret;
          console.log('secret: '+ values.secret.base32);
        }
      });
    }
  }
}
