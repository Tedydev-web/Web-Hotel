import { Component, OnInit } from '@angular/core';
import { ApiService } from '../_service/api.service';

@Component({
  selector: 'app-paymentdetail',
  templateUrl: './paymentdetail.component.html',
  styleUrls: ['./paymentdetail.component.scss']
})
export class PaymentdetailComponent implements OnInit{
  paymentInfo!: any;
  paymentType!: string
  constructor(
    private api: ApiService
  ){}


  ngOnInit(): void {
    // $.getScript('main.js');
    const getloadjs = localStorage.getItem('LoadJs')

    if(getloadjs === '1' ){

      window.location.reload()
      localStorage.removeItem('LoadJs')
    }
    this.api.getInfoPayment().subscribe( res=>{
      this.paymentInfo = res;
      console.log(res);

      this.paymentType = this.paymentInfo.reservationPayment.orderType
      console.log(this.paymentType);


    })

  }

}
