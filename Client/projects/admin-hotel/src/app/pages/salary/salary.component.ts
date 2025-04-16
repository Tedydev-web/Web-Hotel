import { Component, OnInit, PipeTransform } from '@angular/core';
import { DateFilterFn } from '@angular/material/datepicker';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../_service/api.service';
import { Salary } from '../../models/salary';
@Component({
  selector: 'app-salary',
  templateUrl: './salary.component.html',
  styleUrls: ['./salary.component.css']
})
export class SalaryComponent {
    salaryGetAll! : Salary[];
    reservationGetAll!: ReservationModel[]
    reservationFilter! : Salary[];
    searchBooking: string = '' ;
    reservationGetById! : ReservationModel;
    bookingForm!: FormGroup;
    datePayment!: Date

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
      this.salaryGetAll = this.salaryGetAll.filter((item) =>
      item.basicSalary  
      );
      this.searchBooking = '';
      
    }
    clearSearch() {
      this.searchBooking = ''; // Xóa từ khóa tìm kiếm
      this.salaryGetAll = this.reservationFilter
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
    email!: string;

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
  