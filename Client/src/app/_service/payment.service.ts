import { Injectable } from '@angular/core';
import { HttpClient } from '@microsoft/signalr';
import { environment } from 'src/environments/environment.development';
import { Payment } from '../models/payment.models';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor( private http: HttpClient) { }


 
}
