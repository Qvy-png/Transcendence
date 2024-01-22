import { relative } from '@angular-devkit/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faPaperclip, faFloppyDisk } from '@fortawesome/free-solid-svg-icons';
import { Subscription, finalize } from 'rxjs';
import { LogService } from 'src/app/services/log.service';
import { UserInfoService } from 'src/app/services/user-info.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  faClip = faPaperclip;
  faDisk = faFloppyDisk;
  fileName = '';

  changingAvatar: boolean = false;

  url = 'http://localhost:3000/User';
  uploadProgress: number = 0;
  uploadSub: Subscription | null = null;

  twoFa!: boolean;
  color: string = "#46C34B";

  constructor(private http: HttpClient, private logService: LogService, private router: Router, private uInfoService: UserInfoService) {}

  onFileSelected(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files) {
      const file = inputElement.files.item(0);

      if (file) {
        this.fileName = file.name;
        
        const formData = new FormData();
        
        formData.append('image', file);
        
        console.log(formData.get('icon'));

        const myObject = {
          token: this.uInfoService.getToken('id_token')
        };
        // console.log(myObject.token[1]);
        let auth_token =  JSON.stringify(myObject.token.substring(10 , myObject.token.length - 2));
        auth_token = auth_token.substring(1,auth_token.length-1);
        console.log(auth_token);
        
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth_token}`
        });
        const httpOption = { headers: headers };

        this.http.post(`${this.url}/uploadFile`, formData).subscribe({

          next: (value) => {
            window.location.reload();
          },
          error: (value) => {
            console.log('no ok');
          }
        });
        // const upload$ = 
        // ,{
          // reportProgress: true,
          // observe: 'events' })
        /*.pipe(finalize( () => this.reset() )*/

        // upload$.subscribe({ 
        //  } );

      }
    }

  }

  reset() {
    this.uploadProgress = 0;
    this.uploadSub = null;
  }

  ngOnInit(): void {
    this.twoFa = this.is2FA();
    this.color = (!this.twoFa ? '#46C34B' : '#D75050');
  }

  /* ------------------------------------ */

  is2FA(): boolean {
    return (this.logService.is2FA());
  }

  set2Fa() {
    console.log('enabling 2fa !');

    this.router.navigate(['twoFa']);

  }
}
