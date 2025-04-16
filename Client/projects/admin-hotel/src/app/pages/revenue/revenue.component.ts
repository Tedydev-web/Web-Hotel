import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../_service/api.service';
import { Staff } from '../../models/staff.model';
import { Observable } from 'rxjs';
import { ReservationModel } from '../booking/booking.component';
@Component({
  selector: 'app-revenue',
  templateUrl: './revenue.component.html',
  styleUrls: ['./revenue.component.css']
})
export class RevenueComponent  implements OnInit{
    numStaff: Staff[] = [];
    numAccount!: number;
    numbBookings!: number;
    revenueTotal!: number;
  constructor(private api: ApiService){}
  ngOnInit(): void {
    $.getScript('assets/js/pages/demo.dashboard.js');
    this.api.getallUser().subscribe( res =>{
      this.numStaff = res
      console.log(this.numStaff)

    })

   this.countAccounts()
   this.acountBooking()
   this.getRevenue()
  }
  sideBarOpen = true;

  sideBarToggler() {
    this.sideBarOpen = !this.sideBarOpen;
  }

  getRevenue() {
    this.api.getAllReservation().subscribe((reservations: ReservationModel[]) => {
      this.revenueTotal = reservations.reduce((total, reservation) => total + reservation.reservationPrice, 0);
    });
  }
  async countAccounts(): Promise<number> {
    try {
        const accounts: Observable<Staff[]> = this.api.getallUser();
        const staffArray: Staff[] = await accounts.toPromise() || [] ;
        if (staffArray) {
            const length = staffArray.length;

            this.numAccount = length
            console.log('Total accounts:', length);
            return length;
          } else {
            console.log('Staff array is undefined.');
            return 0;
          }
        } catch (error) {
          console.error('Error fetching accounts:', error);
          return 0;
        }
    }
 
  async acountBooking(): Promise<number> {
    try {
        const bookings: Observable<ReservationModel[]> = this.api.getAllReservation();
        const bookingArray: ReservationModel[] = await bookings.toPromise() || [] ;
        if (bookingArray) {
            const length = bookingArray.length;

            this.numbBookings = length
            console.log('Total bookings:', length);
            return length;
          } else {
            console.log('Booking array is undefined.');
            return 0;
          }
        } catch (error) {
          console.error('Error fetching bookings:', error);
          return 0;
        }
    }
 
}
