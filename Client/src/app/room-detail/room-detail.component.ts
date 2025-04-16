import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { Room } from '../models/room.model';
import { ApiService } from '../_service/api.service';
import { ViewportScroller } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ModalComponent } from '../pages/modal/modal/modal.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SearchRoom } from '../models/searchRoom.model';
import { userProfile } from '../models/userProfile.model';
import { Booking } from '../models/booking.model ';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.development';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../_service/auth.service';
MatDialog;
@Component({
  selector: 'app-room-detail',
  templateUrl: './room-detail.component.html',
  styleUrls: ['./room-detail.component.scss'],
})
export class RoomDetailComponent implements OnInit {
  imgUrl!: string;
  id!: any;
  rateForm!: FormGroup;
  room!: Room;
  imageUrls: string[] = [];
  roomId!: any;
  showDiscount: number = 0;
  discount!: number;
  rating = 0;
  numberOfPeople!: number
  checkIn:any = this.route.snapshot.paramMap.get("checkIn");
  checkOut:any = this.route.snapshot.paramMap.get("checkOut");
  formReservation!:FormGroup;
  get f(){
    return this.formReservation.controls
  }
  constructor(private route: ActivatedRoute, private router: Router, private apiService: ApiService, private viewPort: ViewportScroller, private dialogref: MatDialog, private http: HttpClient,private toastr: ToastrService, private fb: FormBuilder){
    this.formReservation = this.fb.group({
      checkIn : new Date().toISOString(),
      checkOut : new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
      numberOfPeople: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() {
    if (this.checkIn != undefined || this.checkOut != undefined) {
      this.formReservation.controls['checkIn'].setValue(this.checkIn);
      this.formReservation.controls['checkOut'].setValue(this.checkOut);
    }
    this.formReservation.controls['numberOfPeople'].setValue(1);
    window.scrollTo(0, 0);
    this.roomId = this.route.snapshot.paramMap.get('id');
    this.viewPort.scrollToPosition([0, 0]);
    this.getRoomById();
    localStorage.setItem('roomId', JSON.stringify(this.roomId));
  }

  openDialog() {
    this.dialogref.open(ModalComponent);
  }
  getRoomById(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.apiService.getRoomDetail(id).subscribe((res) => {
      this.room = res;
      this.showDiscount = res.discountPrice;
      const linkArray: string[] = JSON.parse(res.roomPictures);
      const formattedLinks: string[] = linkArray.map(
        (link: string) => `${link}`
      );
      this.imageUrls = formattedLinks;
    });
  }

  bookingRoom() {
    const checkInValue = new Date(
      this.formReservation.controls['checkIn'].value
    ).setHours(7, 0, 0);
    const checkOutValue = new Date(
      this.formReservation.controls['checkOut'].value
    ).setHours(7, 0, 0);

    if (!checkInValue || !checkOutValue) {
      return;
    }
    const checkInDate = new Date(checkInValue);
    const checkOutDate = new Date(checkOutValue);
    const numberOfNights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    var userProfileLocal = new userProfile();
    var userProfileTemp = localStorage.getItem('user_profile');
    if (userProfileTemp != null) {
      if (userProfileTemp!.length > 0) {
        let result = localStorage.getItem('user_profile')!;
        userProfileLocal = JSON.parse(result) as userProfile;
      }
    }
    var payLoad = new Booking();
    payLoad.startDate = new Date(checkInValue);
    payLoad.endDate = new Date(checkOutValue);
    payLoad.roomId = this.room.id;
    payLoad.numberOfDay = numberOfNights;
    payLoad.numberOfPeople = Number.parseInt(
      this.formReservation.controls['numberOfPeople'].value
    );
    payLoad.name = userProfileLocal.userName;
    payLoad.email = userProfileLocal.email;
    payLoad.phoneNumber = userProfileLocal.phoneNumber;
    payLoad.address = userProfileLocal.address;
    this.http
      .post<any>(`${environment.BASE_URL_API}/user/reservation/create`, payLoad)
      .subscribe(
        (res) => {
          this.toastr.success(res.message);
          this.router.navigate(['/checkout', res.reservationId]);
        },
        (_err) => {
          const wrongtime = _err.error.title;
          if (wrongtime) {
            this.toastr.error(_err.error.title);
          } else {
            this.toastr.error(_err.error.message);
          }
        }
      );
  }
}
