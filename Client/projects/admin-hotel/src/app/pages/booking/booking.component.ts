import { Component, OnInit, PipeTransform } from '@angular/core';
import { DateFilterFn } from '@angular/material/datepicker';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { timeout } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApiService } from 'src/app/_service/api.service';
import { ServiceAttach } from '../../models/serviceAttach.model';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent implements OnInit{
  reservationGetAll! : ReservationModel[];
  reservationFilter! : ReservationModel[];
  searchBooking: string = '' ;
  reservationGetById! : ReservationModel;
  bookingForm!: FormGroup
  constructor(private http: HttpClient, private fb: FormBuilder, private api: ApiService){

    this.bookingForm = this.fb.group({
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        roomId: [''],
        numberOfDay: [''],
        email: [''],
        name: [''],
        phoneNumber: [''],
        address: [''],
        paymentMethod: ['momo'],
    })
  }
  ngOnInit(): void {
    this.GetReservationAll();
    if(this.searchBooking !== ''){
        this.GetReservationAll()
    }
  }
  GetReservationAll()
  {
    this.http.get<ReservationModel[]>(environment.BASE_URL_API+"/v2/admin/reservation/get-all")
    .subscribe(
      (res: any)=>{
        this.reservationGetAll = res;
        this.reservationFilter = res;
      },
      (err) => {
        console.log(err);
      }
    )
  }
  GetReservationById(id : string)
  {
    this.http.get<ReservationModel>(environment.BASE_URL_API+`/v2/admin/reservation/get-by-id?id=${id}`)
    .subscribe(
      (res)=>{
        this.reservationGetById = res;
        console.log(this.reservationGetById);

      },
      (err) => {
        console.log(err);
      }
    )
  }

  searchBookings() {
    // Chuyển đổi từ khóa tìm kiếm thành chữ thường
    const searchTerm = this.searchBooking.toLowerCase();
    // Lọc các đặt phòng dựa trên từ khóa tìm kiếm
    this.reservationGetAll = this.reservationGetAll.filter((item) =>
    item.roomNumber.toLowerCase().includes(searchTerm)  ||
    item.name.toLowerCase().includes(searchTerm) ||
    item.id.toLowerCase().includes(searchTerm) 
    );
    this.searchBooking = '';
    
  }
  clearSearch() {
    this.searchBooking = ''; // Xóa từ khóa tìm kiếm
    this.reservationGetAll = this.reservationFilter
  }
}

export class ReservationModel
{
  id! : string;
  startDate!: string;
  numberOfDay!: number;
  endDate!: Date;
  roomPrice!: number;
  createdAt!: string;
  updatedAt!: string;
  reservationPrice!: number;
  roomNumber!: string;
  name!: string;
  phoneNumber!: string;
  address!: string;
  userName!: string;
  status!: boolean;
  reservationPayment!: ReservationPaymentModel;
  serviceAttachs!: ServiceAttach
}

export class ReservationPaymentModel
{
  id! : string;
  createdAt!: Date;
  priceTotal!: number;
  orderInfo!: string;
  orderType!: string;
  payType!: string;
  status!: number;
  message!: string;
  reservationId!: any;
  reservation!: any;
}
