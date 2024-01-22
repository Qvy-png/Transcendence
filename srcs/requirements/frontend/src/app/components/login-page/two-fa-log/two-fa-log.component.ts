import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LogService } from 'src/app/services/log.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-two-fa-log',
  templateUrl: './two-fa-log.component.html',
  styleUrls: ['./two-fa-log.component.css']
})
export class TwoFaLogComponent implements OnInit {
  code!: string;
  twoFa: boolean = false;
  curId!: number;

  constructor(private logService: LogService, private route: ActivatedRoute, private router: Router) {}

  onSubmit() {
    if (!this.code) {
      alert('Enter 2Fa code !');
      return ;
    }

    this.logService.enable2FA();
    this.logService.verify2FAToken(this.curId, this.code).pipe(take(1)).subscribe({
      next: (value) => {
        console.log(value);
        
        this.logService.set2FaVer(true);
        this.logService.setAuth(true);

        let statInfo = {status: 'ONLINE'};
        this.logService.updateUser(this.curId, statInfo).pipe(take(1)).subscribe();

        this.router.navigate(['/main']);
      },
      error: (err) => {
        console.log(err);
        console.log('error ver 2fa');
        
        this.logService.set2FaVer(false);
      },
    });
  }

  cancelTwoFaLog() {
    this.logService.logout(this.curId);
  }

  ngOnInit(): void {
    this.route.queryParams.pipe(take(1)).subscribe( (params) => {
      this.curId = params['id'];
    });    
  }
}
