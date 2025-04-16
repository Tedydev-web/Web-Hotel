import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@microsoft/signalr';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/_service/api.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit{
  id!: string;
  rateForm!: FormGroup;
  constructor (private api: ApiService, private toast: ToastrService, private fb: FormBuilder, private route: ActivatedRoute){}
  ngOnInit(): void {
    this.rateForm = this.fb.group({
      rating: [''] // FormControl cho rating
    });

    const bookingData = localStorage?.getItem('roomId')
    const bookingDataString = bookingData !== null ? bookingData.toString() : '';
    const bookingDataWithoutQuotes = bookingDataString.replace(/"/g, '');
    this.id = (bookingDataWithoutQuotes);
    console.log(this.id);



  }

  onSubmit(){
    const ratingControl = this.rateForm.get('rating');

    if (ratingControl && ratingControl.value !== null) {
      const ratingValue = ratingControl.value;
      parseInt(ratingValue)

      const starrating = ratingValue.replace(/"/g, '');
      // Tạo request body từ giá trị ratingValue
    this.api.votingStar(ratingValue, this.id).subscribe(res =>{
      this.toast.success("Rating Successfully!")
    },err =>{
    })
    }
}
}
