import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/_service/auth.service';

@Component({
  selector: 'app-password-change',
  templateUrl: './password-change.component.html',
  styleUrls: ['./password-change.component.scss']
})
export class PasswordChangeComponent implements OnInit{
  email!: string;
  changeForm!: FormGroup;
  submitted = false;
  get f() {
    return this.changeForm.controls
  }
  constructor(
    private auth: AuthService,
    private fb: FormBuilder,
    private toast: ToastrService
  ){
    this.changeForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required,Validators.pattern(/^\S*$/), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{8,}$/)]],
      confirmNewPassword:  ['', [Validators.required,Validators.pattern(/^\S*$/), this.passwordMatchValidator]]
    })
  }
  ngOnInit(): void {
    this.auth.getUserProfile().subscribe(res=>{
      console.log(res);
      this.email = res.email

    })


  }

  changePass(changeForm: FormGroup){
    this.auth.changePass(this.changeForm.value).subscribe( res=>{
      console.log(res);

      this.toast.success(" Change Password Successfully !")
    },err=>{
      let errorMess = err.error.title

      if(!errorMess){
        this.toast.error("Something was wrong !")
      }else{
        this.toast.error(err.error.message)
      }
    })
  }
  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.root.get('newPassword');
    const confirmPassword = control.value;

    if (password && confirmPassword !== password.value) {
      return { 'passwordMismatch': true };
    }

    return null;
  }
  onSubmit(){
    this.changeForm.controls["email"].setValue(this.email);

    if(this.changeForm.valid){

      this.changePass(this.changeForm.value)
    }else{
      this.toast.error(" Please type password to change!")

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
