import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import {
  BehaviorSubject,
  catchError,
  first,
  from,
  lastValueFrom,
  map,
  mergeMap,
  Observable,
  of,
  tap,
  throwError,
} from 'rxjs';
import { AuthService } from '../_service/auth.service';
import { TokenModel } from '../_service/token.model';

import { StorageService } from '../_service/storage.service';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );
  constructor(
    private jwtHelper: JwtHelperService,
    private authService: AuthService,
    private router: Router,
    private store: StorageService,
    private toastr: ToastrService
  ) {}
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let authReq = req;
    if (req.url.indexOf('login') > 0 || req.url.indexOf('token/refresh') > 0) {
      return next.handle(req);
    }

    var check = this.authService.isLoggedIn();

    var accessToken = this.store.getAccessToken();
    var isTokenExpired = this.jwtHelper.isTokenExpired(accessToken);
    if (isTokenExpired == false) {
      return next.handle(this.addTokenHeader(req, accessToken));
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          if (!check) {
            this.toastr.error('Please login');
          } else {
            return this.handle401Error(authReq, next, this.router, this.toastr);
          }
        }
        return throwError(error);
      })
    );
  }
  async refreshToken(token: any): Promise<TokenModel> {
    const res$ = this.authService
      .refreshToken(token)
      .pipe(map((res) => res))
      .pipe(first());
    const res = await lastValueFrom(res$);
    localStorage.setItem('token', JSON.stringify(res));
    return res;
  }
  handle401Error(
    request: HttpRequest<any>,
    next: HttpHandler,
    router: Router,
    toastr: ToastrService
  ) {
    const localStorageTokens = localStorage.getItem('token');
    this.refreshTokenSubject.next(null);
    if (localStorageTokens) {
      var token = JSON.parse(localStorageTokens) as TokenModel;
      var isTokenExpired = this.jwtHelper.isTokenExpired(token.accessToken);
      if (isTokenExpired) {
        return from(this.refreshToken(token)).pipe(
          mergeMap((tokenNew) => {
            const cloned = request.clone({
              headers: request.headers.set(
                'Authorization',
                'Bearer ' + tokenNew.accessToken
              ),
            });
            return next.handle(cloned);
          }),
          tap({
            error(err) {
              localStorage.removeItem('token');
              localStorage.removeItem('user_profile');
              toastr.error('Login session has expired, please login again');
              router.navigate(['login']);
            },
          })
        );
      }
      const cloned = request.clone({
        headers: request.headers.set(
          'Authorization',
          'Bearer ' + token.accessToken
        ),
      });
      return next.handle(cloned);
    }
    return of();
  }

  private addTokenHeader(request: HttpRequest<any>, token: string) {
    return request.clone({
      headers: request.headers.set('Authorization', `bearer ${token}`),
    });
  }
}
