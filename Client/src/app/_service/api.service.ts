import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Room } from '../models/room.model';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment.development';
import { Blog } from '../models/blog.model';
import { User } from './user.model';
import { Data } from '@angular/router';
import { Search } from '../models/search.model';
import { Payment } from '../models/payment.models';
import { Invoice } from '../models/invoice.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient, private auth: AuthService) {}
  user: any;
  room: any;
  blog: any;
  apiRooms = environment.BASE_URL_API + '/user/room/get-all';
  apiBlog =
    environment.BASE_URL_API + '/user/blog/get-all';
  apiRoomm = 'http://localhost:3000/rooms';
  getRooms() {
    // return this.http.get<Room[]>(environment.BASE_URL_API + '/user/room/get-all');
    return this.http.get<Room[]>(
      environment.BASE_URL_API + 'user/room/get-all'
    );
  }

  getRoomDetail(id: string): Observable<Room> {
    const url = `${environment.BASE_URL_API}/user/room/get-by-id?id=${id}`;
    // const url = `${this.baseUrl1}/${id}`;
    return this.http.get<Room>(url);
  }

  getRoomBySearch(dataSearch: any): Observable<Room> {
    const url = `${environment.BASE_URL_API}/user/room/get-by-all`;
    return this.http.post<Room>(url, dataSearch);
  }

  getRoomOnSale() {
    return this.http.get<Room[]>(
      environment.BASE_URL_API + '/user/room/get-top-on-sale'
    );
  }
  postRoom(_room: Room) {
    return this.http.post<Room>(
      environment.BASE_URL_API + '/user/room/get-by-id',
      _room
    );
  }

  deleteRoom(id: string) {
    return this.http.delete(
      environment.BASE_URL_API + '/user/room/delete-by-id' + id
    );
  }
  searchRoom(): Observable<Search[]> {
    return this.http.get<Search[]>(
      environment.BASE_URL_API + '/user/search-room'
    );
  }

  bookRoom(
    startDate: Data,
    enDate: Data,
    roomId: string,
    numberOfDays: number
  ): Observable<any> {
    const data = {
      start_date: startDate,
      end_date: enDate,
      room_id: roomId,
      number_of_days: numberOfDays,
    };
    return this.http.post(environment.BASE_URL_API + '', data);
  }

  //Blog Api
  getBlogs() {
    return this.http.get<Blog[]>(
      environment.BASE_URL_API + '/user/blog/get-all'
    );
  }

  getBlogDetail(id: number): Observable<Blog> {
    return this.http.get<Blog>(
      `${environment.BASE_URL_API}/user/blog/get-by-id?id=${id}`
    );
  }
  getNewestBlog() {
    return this.http.get<Blog[]>(
      environment.BASE_URL_API + '/user/blog/get-top-new'
    );
  }
  // Api User
  getUser() {
    this.user = this.auth.userProfile;
    return this.user;
  }
  ////////////////////////Payment
  payment(payment: Payment) {
    return this.http.post(
      environment.BASE_URL_API + '/user/invoice/create',
      payment
    );
  }

  vnpay(amount: number, orderDescription: string, name: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json, text/plain',
      'Access-Control-Allow-Origin': '*',
    });

    return this.http.post(
      environment.BASE_URL_API + '/user/vn-pay/create',
      { amount, orderDescription, name },
      { headers }
    );
  }
  successPayment() {
    return this.http.get(
      environment.BASE_URL_API + '/user/reservation/get-successful'
    );
  }
  /////////////////////////// Voting
  votingStar(stars: number, roomid: string) {
    const data = {
      number: stars,
      roomId: roomid,
    };
    return this.http.post(
      environment.BASE_URL_API + '/user/room-star/create',
      data
    );
  }

  /////////////////// Roles Based

  addRole(name: string) {
    return this.http.post(
      environment.BASE_URL_API + '/v2/admin/role/create',
      name
    );
  }

  /////////////////// Payment

  getInfoPayment(): Observable<any[]> {
    return this.http.get<any[]>(
      environment.BASE_URL_API + '/user/reservation/get-successful'
    );
  }
}
