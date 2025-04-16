import { HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { AuthService } from '../_service/auth.service';
import { StorageService } from '../_service/storage.service';
import { User } from '../_service/user.model';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router,
    private storage: StorageService,
    private toastr: ToastrService
  ) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    // $.getScript('/assets/js/main.js');

    var script = document.createElement('script');
    document.head.appendChild(script);
    script.type = 'text/javascript';
    script.src = '/assets/js/main.js';
    script.id = 'main-js';
    script.onload;
    document.head.removeChild(script);

    var token = this.storage.isLoggedIn();
    if (token) {
      if (state.url == '/login') {
        this.router.navigate(['/home']);
        return true;
      }
      return true;
    } else {
      if (route.data['requiredAuth'] == true) {
        this.router.navigate(['/login']);
        this.toastr.warning('Please login to perform this function!');
        return false;
      }
      return true;
    }
  }
}
