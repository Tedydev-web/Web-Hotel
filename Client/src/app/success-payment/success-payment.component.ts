import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../_service/api.service';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Toast, ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup } from '@angular/forms';
import { environment } from 'src/environments/environment.development';
import { Room } from '../models/room.model';
import { CheckoutComponent } from '../checkout/checkout.component';
import { catchError, of, throwError } from 'rxjs';
@Component({
  selector: 'app-success-payment',
  templateUrl: './success-payment.component.html',
  styleUrls: ['./success-payment.component.scss'],
})
export class SuccessPaymentComponent implements OnInit {
  urlParams = new URLSearchParams(window.location.search);
  resultCode: any;
  message: any;
  orderType: any;
  orderInfo: any;
  payType: any;
  amount: any;
  vnp_ResponseCode = this.urlParams.get('vnp_ResponseCode');
  invoiceForm!: FormGroup;
  reservationId!: any;
  constructor(
    private router: Router,
    private api: ApiService,
    private http: HttpClient,
    private fb: FormBuilder,
    private toast: ToastrService,
    private checkout: CheckoutComponent
  ) { }
  ngOnInit(): void {
    if (this.urlParams.toString().indexOf('vnp') >= 0) {
      this.resultCode = this.urlParams.get('vnp_ResponseCode');
      this.message = this.urlParams.get('vnp_TransactionNo');
      this.orderType = this.urlParams.get('vnp_BankCode');
      this.orderInfo = this.urlParams.get('vnp_OrderInfo');
      this.payType = this.urlParams.get('vnp_CardType');
      this.amount = this.urlParams.get('vnp_Amount');
    } else {
      this.resultCode = this.urlParams.get('resultCode');
      this.message = this.urlParams.get('message');
      this.orderType = this.urlParams.get('orderType');
      this.orderInfo = this.urlParams.get('orderInfo');
      this.payType = this.urlParams.get('payType');
      this.amount = this.urlParams.get('amount');
    }
    // Get value of bookingForm is stored in checkout component
    this.reservationId = localStorage.getItem('reservationId');
    // Form Invoice
    this.invoiceForm = this.fb.group({
      priceTotal: this.amount,
      orderInfo: this.orderInfo,
      orderType: this.orderType,
      payType: this.payType,
      status: 1,
      message: this.message,
      reservationId: this.reservationId,
    });
    if (this.resultCode == '0' || this.resultCode == '00') {
      this.http
        .post<any>(
          `${environment.BASE_URL_API}/user/invoice/create`,
          this.invoiceForm.value
        )
        .pipe(
          catchError((err) => {
            return throwError(err);
          })
        )
        .subscribe(
          (res) => {
            this.toast.success(res.message);
          },
          (_err) => {
            if (_err.status != undefined) {
              this.router.navigate(['/home']);
              this.toast.warning(
                'Payment has been successful, please check your booking history'
              );
            } else {
              this.toast.error(_err.message);
            }
          }
        );
    }
  }
}

