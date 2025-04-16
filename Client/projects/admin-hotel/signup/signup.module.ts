import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutpageComponent } from '../src/app/pages/layoutpage/layoutpage.component';
import { Routes } from '@angular/router';
import { AuthGuard } from '../src/app/_helper/http.guard';
import { SignupComponent } from '../src/app/pages/signup/signup.component';

const routes: Routes = [
  {
    path: 'signup',
    component: SignupComponent,
    data: {
      requiredAuth: false
    },
    canActivate: [AuthGuard]
  },
];


@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class SignupModule { }
