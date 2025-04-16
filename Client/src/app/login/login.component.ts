import { Component, OnInit } from '@angular/core';
import * as http from '@angular/common/http';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  NgModel,
  Validators,
} from '@angular/forms';
import { AuthService } from '../_service/auth.service';
import { TokenModel } from '../_service/token.model';
import { environment } from '../../environments/environment.development';
import { HomepageComponent } from '../homepage/homepage.component';
import { ToastrService } from 'ngx-toastr';
import { userProfile } from '../models/userProfile.model';
import { LoaderService } from '../_service/loader.service';
// import { AuthinterceptorInterceptor } from '../shared/auth/authinterceptor.interceptor';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  submitted = false;
  password: any;
  show = false;
  req: http.HttpRequest<any> | undefined;
  loading = false;
  loginForm!: FormGroup;
  data: any;
  user_profile : userProfile | undefined;
  get f() {
    return this.loginForm.controls;
  }
  constructor(
    private auth: AuthService,
    private fb: FormBuilder,
    private route: Router,
    private toast: ToastrService,
  ) {}
  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(30),
        ],
      ],
    });
    this.OnClick()
  }
  OnClick(){
    if(this.password === 'password'){
      this.password = 'text';
      this.show = true;
    }else{
      this.password = 'password';
      this.show = false
    }
  }
  routeReset() {
    window.location.href =
      environment.BASE_URL_WEB + `/reset-password?code=reset`;
  }

  login() {
    const email = this.loginForm?.get('email')?.value;
    const password = this.loginForm?.get('password')?.value;
    this.auth.login(email, password).subscribe(
      (response) => {
        var token = response as TokenModel;
        localStorage.setItem('token', JSON.stringify(token));
        this.toast.success("Login successfull");
        this.auth.getUserProfile().subscribe((res) =>
        {
          localStorage.setItem('user_profile', JSON.stringify(res))
        },
        (err)=>
        {

        });
        this.route.navigateByUrl('/home');
      },
      (err) => {
        err
      }
    );
  }

  getUserData() {
    window.self.close();
  }
  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.login();
  }
}
