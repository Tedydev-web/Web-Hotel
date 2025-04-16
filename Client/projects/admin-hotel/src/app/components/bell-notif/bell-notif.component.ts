import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import * as signalR from '@microsoft/signalr';
import { HubConnection } from '@microsoft/signalr';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment.development';
import { AuthService } from '../../_service/auth.service';
import { StorageService } from '../../_service/storage.service';
import { TokenModel } from '../../_service/token.model';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-bell-notif',
  templateUrl: './bell-notif.component.html',
  styleUrls: ['./bell-notif.component.less'],
})
export class BellNotifComponent implements OnInit {
  // private hubOptions: IHttpConnectionOptions = {
  //   headers: { Authorization: 'Bearer ' + this.storage.getAccessToken() },
  // };
  count_nof: any;
  items_nof: any;
  constructor(
    private storage: StorageService,
    private jwtHelper: JwtHelperService,
    private authService: AuthService,
    private toastr: ToastrService,
    private route: Router,
    private http: HttpClient
  ) {
    this.count_nof = 0;
  }
  async ngOnInit() {
    await this.checkAndRefreshToken();

    if (this.storage.isLoggedIn()) {
      var hubConnection: HubConnection;
      hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(environment.BASE_URL_API + '/hub', {
          accessTokenFactory: () => this.storage.getAccessToken(),
        })
        .build();
      hubConnection
        .start()
        .then(function () {
          console.log('SignalR Connected!');
          sendMessage(hubConnection);
          sendNotificationGetRoom(hubConnection);
        })
        .catch(function (err) {
          return console.error('đã lỗi' + err.toString());
        });
      hubConnection.on('ReceiveMessage', (sender, message) => {
        console.log(sender + ': ' + message);
      });
      hubConnection.on('ReceiveNotification', (res) => {
        this.count_nof = res.count;
        this.items_nof = res.items;
      });
    }
  }
  async checkAndRefreshToken(): Promise<void> {
    const localStorageTokens = localStorage.getItem('token_admin');
    if (localStorageTokens) {
      var token = JSON.parse(localStorageTokens) as TokenModel;
      var isTokenExpired = this.jwtHelper.isTokenExpired(token.accessToken);
      if (isTokenExpired) {
        await this.refreshToken(token);
      }
    }
  }
  async refreshToken(token: any): Promise<void> {
    var check = true;
    const res$ = await this.authService
      .refreshToken(token)
      .toPromise()
        .then((res) => {
          console.log(1);
          
        localStorage.setItem('token_admin', JSON.stringify(res));
      })
        .catch((error) => {
          console.log(2);
          
        localStorage.removeItem('token_admin');
        localStorage.removeItem('user_profile');
        this.toastr.error('Login session has expired, please login again');
        this.route.navigate(['login']);
      });
  }

  deleteNotification(id: any, i: any) {
    this.http
      .get<any>(
        environment.BASE_URL_API + `/v3/notification/delete-by-id?id=${id}`
      )
      .subscribe(
        (res) => {
          this.toastr.success(res.message);
          this.count_nof--;
          this.items_nof.splice(i, 1);
        },
        (err) => {
          this.toastr.error(err.message);
        }
      );
  }
}

function sendMessage(hubConnection: HubConnection) {
  hubConnection!.invoke('SendChatMessageAuto', 'Ok hiểu').catch(function (err) {
    return console.error(err.toString());
  });
}
function sendNotificationGetRoom(hubConnection: HubConnection) {
  hubConnection!.invoke('GetAllNotification').catch(function (err) {
    return console.error(err.toString());
  });
}
