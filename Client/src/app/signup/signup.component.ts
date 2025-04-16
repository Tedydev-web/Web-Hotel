import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ValidationErrors, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment.development';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {
  submitted = false;
  password: any;
  show = false;
  signup!: FormGroup;
  signuser: any;
  userName!: string;
  email!: any;
  get f() {
    return this.signup.controls
  }
  constructor(private http: HttpClient, private route: Router, private fb: FormBuilder, @Inject(DOCUMENT) private document: Document, private toast: ToastrService) { }
  ngOnInit(): void {

    this.signup = this.fb.group({
      name: ['', Validators.required, Validators.name],
      email: ['', [Validators.required, Validators.email]],
      userName: ['', [Validators.required, Validators.pattern(/^\S*$/)]],
      phoneNumber: ['',  [Validators.required, Validators.pattern("[0-9 ]{10}")]],
      password: ['', [Validators.required,Validators.pattern(/^\S*$/), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{8,}$/)]],
      confirmPassword: ['', [Validators.required,Validators.pattern(/^\S*$/), this.passwordMatchValidator]]
    })
    this.injectScript("assets/js/signup/signup.js");
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
  signupdata(signup: FormGroup) {

    this.http.post<any>(`${environment.BASE_URL_API}/user/register`, this.signup.value)
      .subscribe(res => {

        this.toast.success(res.message)
        this.route.navigate(['login'])
      }, _err => {


        if (!_err.error.title) {
          this.toast.error(_err.error.message)
        } else {
          // alert(_err.error.title)
        }


      })
  }

  onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.signup.invalid) {
      return
    }
    this.signupdata(this.signup);



  }
  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.root.get('password');
    const confirmPassword = control.value;

    if (password && confirmPassword !== password.value) {
      return { 'passwordMismatch': true };
    }

    return null;
  }

  public injectScript(src: string) {
    if (this.document && src?.trim()) {
      const script = this.document.createElement("script");
      script.setAttribute("type", "text/javascript");
      script.setAttribute("src", src.trim());
      this.document.head?.appendChild(script);
    }
  }
}
export class UsernameValidator {

  static cannotContainSpace(control: AbstractControl) : ValidationErrors | null {

      if((control.value as string).indexOf(' ') >= 0){

          return {cannotContainSpace: true}

      }

      return null;

  }

}
