import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Params, Route } from '@angular/router';
import { Observable, map, switchMap } from 'rxjs';
import { ApiService } from 'src/app/_service/api.service';
import { AuthService } from 'src/app/_service/auth.service';
import { UserService } from 'src/app/_service/user.service';
import { userProfile } from 'src/app/models/userProfile.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  userProfile = new userProfile;
  checkContent : any;

  constructor(private http: HttpClient, private auth: AuthService,
    private route:ActivatedRoute,
    private apiServe: ApiService,
    private userService: UserService){}
  ngOnInit() {
    this.getUserProfile();
    this.checkContent = 0;
  }

  getUserProfile() : any{
    this.userService.getUserProfile().subscribe((res) => {
      this.userProfile = res;
    })
  }

  isLoggedIn() {
    return this.auth.isLoggedIn();
  }
  getUser(){
    return this.apiServe.getUser()
  }
  getLoggedInUser() {
    return this.auth.getLoggedInUser();
  }

  logout(): void {
    // Xóa thông tin người dùng khỏi localStorage hoặc sessionStorage khi đăng xuất
    localStorage.removeItem('token');
  }
}
