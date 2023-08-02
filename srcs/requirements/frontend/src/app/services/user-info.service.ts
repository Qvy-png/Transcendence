import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs';
import { User } from '../User';

@Injectable({
  providedIn: 'root'
})

export class UserInfoService {
  private apiUrl = 'https://localhost:3000/api';
  user!: User;
  one = 1;
  constructor(private http:HttpClient) { }

  getId(): Observable<   {
    this.user = this.http.get('${this.apiUrl}/${this.one}');
    
  }
}
