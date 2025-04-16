import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes } from '@angular/router';
import { LoginAdminComponent } from '../src/app/pages/login-admin/login-admin.component';
import { AuthGuard } from '../src/app/_helper/http.guard';
const routes: Routes = [
  {
    path: 'login',
    component: LoginAdminComponent,
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
export class AdminModule { }
