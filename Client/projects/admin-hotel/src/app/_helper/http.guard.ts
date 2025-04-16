
import { HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    RouterStateSnapshot,
    UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../_service/auth.service';
import { StorageService } from '../_service/storage.service';
import { User } from '../_service/user.model';
import { JwtHelperService } from '@auth0/angular-jwt';


@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private auth: AuthService, private router: Router, private storage: StorageService, private jwt: JwtHelperService) { }
    roleAccount!: User
    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ):
        | boolean
        | UrlTree
        | Observable<boolean | UrlTree>
        | Promise<boolean | UrlTree> {
        const id = Number(route.paramMap.get('id'));

        // var check = this.auth.checkAccessTokenAndRefresh();
        //add js will load
        // $.getScript('assets/js/main.js');
        $.getScript('main.js');

        this.getRole()




        var token = this.storage.isLoggedIn();
        console.log(token);

        if (token) {
            if (state.url.indexOf('login') > 0) {
                this.router.navigate(['/dashboard']);
                return true;

            }
            if (route.data['requiredAdmin'] == true) {
                if (this.roleAccount.role.includes('Admin')) {
                    return true
                } else {
                    this.router.navigate(['/**']);
                    return false;

                }
            }

            return true;
        } else {
            if (route.data['requiredAuth'] == true) {
                this.router.navigate(['/**']);
                return false;
            }
            return true;
        }
    }
    getRole() {
        const tokenTemp = localStorage.getItem('token_admin')
        if (tokenTemp !== null) {
            const tokenInfo = JSON.parse(tokenTemp)
            const accessToken = tokenInfo.accessToken

            var claims = JSON.stringify(this.jwt.decodeToken(accessToken));

            claims = claims.replaceAll(
                'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/',
                ''
            );
            claims = claims.replaceAll(
                'http://schemas.microsoft.com/ws/2008/06/identity/claims/',
                ''

            );
            this.roleAccount = JSON.parse(claims) as User;

            localStorage.setItem('Roletype', this.roleAccount.role.toString())




        }

    }
}
