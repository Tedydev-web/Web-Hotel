import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment.development';
import { AuthService } from '../_service/auth.service';

@Component({
  selector: 'app-resetpassword',
  templateUrl: './resetpassword.component.html',
  styleUrls: ['./resetpassword.component.scss']
})
export class ResetpasswordComponent {

  form!: FormGroup;
  loading = false;
  submitted = false;
  newPassword: any;
  confirmNewPassword: any;
  password: any;
  show = false;
  get f() {
    return this.form.controls
  }
  constructor(
    private auth: AuthService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastrService) { }
  ngOnInit() {
    this.form = this.fb.group({
      newPassword: ['', [Validators.required,Validators.pattern(/^\S*$/), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{8,}$/)]],
      confirmNewPassword: ['', [Validators.required,Validators.pattern(/^\S*$/), this.passwordMatchValidator]]
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
  // get f() { return this.form.controls; }
  onSubmit() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }
    this.loading = true;
    var token =this.route.snapshot.queryParams['token'];
    var email = this.route.snapshot.queryParams['email'];

    this.auth.confirmChangePasswordViaEmail(token, this.form.value.newPassword, this.form.value.confirmNewPassword, email)
      .subscribe((res) => {
          //thêm toasrt res.message
          this.toast.success(res.message);
          this.router.navigate(['login']);
      },
        (err) => {
          this.toast.error(err.error.message);
        })
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const newPassword = control.root.get('newPassword');
    const confirmNewPassword = control.value;

    if (newPassword && confirmNewPassword !== newPassword.value) {
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
