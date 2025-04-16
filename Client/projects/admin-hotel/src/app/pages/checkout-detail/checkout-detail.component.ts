import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../_service/api.service';
import { HttpClient } from '@microsoft/signalr/dist/esm/HttpClient';
import { environment } from '../../environments/environment.development';
import { ReservationModel } from '../invoice/invoice.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-checkout-detail',
  templateUrl: './checkout-detail.component.html',
  styleUrls: ['./checkout-detail.component.css']
})

export class CheckoutDetailComponent implements OnInit{
    reservationGetById!: ReservationModel

    constructor(
        private api: ApiService,
        private http: HttpClient,
        private route: ActivatedRoute
    ){}


    ngOnInit(): void {
        this.route.params.subscribe( params => {
            const id = params['reservationId'];
      
            this.api.getReservationID(id).subscribe((res: any)=>{
                this.reservationGetById = res
            }

            )
          })
}   
}
