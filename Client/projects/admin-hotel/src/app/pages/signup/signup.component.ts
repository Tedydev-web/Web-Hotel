import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '../../_service/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment.development';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent  implements OnInit{
    password!:  any;
    show = false;
    signupForm!: FormGroup;

    get f(){
        return this.signupForm.controls
    }
    constructor(
        private auth: AuthService,
        private fb: FormBuilder,
        private http: HttpClient,
        private toast: ToastrService
    ){
        this.signupForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            userName: ['', [Validators.required, Validators.pattern(/^\S*$/)]],
            password: ['', [Validators.required,Validators.pattern(/^\S*$/), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{8,}$/)]],
            confirmPassword: ['', [Validators.required,Validators.pattern(/^\S*$/), this.passwordMatchValidator]]
        })
    }

    
    ngOnInit(): void {

   
        
    }

    onSubmit(){
        if(this.signupForm.valid){
            this.createAccount(this.signupForm.value)
        }else{
            this.toast.warning("Please type information !")
        }
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
    createAccount(signupForm: FormGroup){
       this.http.post(environment.BASE_URL_API + '/v2/admin/authen/register-employee', this.signupForm.value).subscribe( (res: any) =>{

        this.toast.success(res.message);
        
       },err =>{

        this.toast.error(err.error.message)
       })
    }

    passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
        const password = control.root.get('password');
        const confirmPassword = control.value;
    
        if (password && confirmPassword !== password.value) {
          return { 'passwordMismatch': true };
        }
    
        return null;
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
  