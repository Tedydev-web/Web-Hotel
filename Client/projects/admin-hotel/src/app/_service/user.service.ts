import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { User } from './user.model';
import { environment } from 'src/environments/environment.development';
import { userProfile } from '../models/userProfile.model';

@Injectable({
  providedIn: 'root'
})

export class UserService {


  constructor(private http: HttpClient) { }



  getUserProfile(): Observable<userProfile> {
    return this.http.get<userProfile>(`${environment.BASE_URL_API}/user/user-profile/get`);
  }


}

