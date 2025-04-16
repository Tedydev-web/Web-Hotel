import { Injectable } from '@angular/core';


export class BookingService {

  private bookingForm: any;
  constructor() { }

  setBookingFormData(data: any) {
    this.bookingForm = data;
  }

  getbookingForm() {
    return this.bookingForm;
  }
}
