import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../_service/auth.service';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../environments/environment.development';
import { TokenModel } from '../../_service/token.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login-admin',
  templateUrl: './login-admin.component.html',
  styleUrls: ['./login-admin.component.css'],
})
export class LoginAdminComponent implements OnInit {
  submitted = false;
  req: HttpRequest<any> | undefined;
  email: any;
  password: any;
  loading = false;
  show = false;
  loginForm!: FormGroup;
  data: any;
  userProfile: any;
  get f() {
    return this.loginForm.controls;
  }
  constructor(
    private auth: AuthService,
    private fb: FormBuilder,
    private route: Router,
    private toast: ToastrService
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
        localStorage.setItem('token_admin', JSON.stringify(token));
        this.auth.getUserProfile().subscribe(
          (res) => {
            localStorage.setItem('user_profile', JSON.stringify(res));
            this.toast.success('Login successfull');
          },
          
        );
        this.route.navigate(['dashboard']);
      },err =>{
        this.toast.error(" Something was wrong!")
      }
    );
  }

  showpass() {}
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
