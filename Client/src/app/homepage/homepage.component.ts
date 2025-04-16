import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component, OnInit,Renderer2,ElementRef } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { AuthService } from '../_service/auth.service';
import { ApiService } from '../_service/api.service';
import { Room } from '../models/room.model';
import { Blog } from '../models/blog.model';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Search } from '../models/search.model';
import { SearchService } from '../_service/search.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { daysInWeek, differenceInDays } from 'date-fns';
import { DatePipe } from '@angular/common';
import { ListingComponent } from '../listing/listing.component';
const today = new Date();
const month = today.getMonth();
const year = today.getFullYear();
interface RoomType {
  id: number;
  typeName: string;
  maxPerson: number;
}

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {
  rooms: Room[];
  result!: number;
  numNights!: number;
  filteredRooms!: Room[];
  discountRoom!: Room[];
  blogs: Blog[];
  roomtoDisplay!: Room[];
  blogtoDisplay!: Blog[];
  maxPerson!: any;
  maxPrice = null;
  selectedRoomType = '';
  selectedServiceAttach = '';
  roomTypeName: RoomType[] = [];
  serviceAttachs = [];
  roomSearchForm!: FormGroup;
  peopleNumber: number = 1;
  maxPersonArray:any;
  roomId!: string;
  date = new FormControl(new Date());
  checkIn = new FormControl(new Date().toISOString());
  checkOut = new FormControl(new Date(new Date().setDate(new Date().getDate() + 1)).toISOString());


  constructor(
    private http: HttpClient,
    private toast: ToastrService,
    private apiService: ApiService,
    private activeRoute: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private el: ElementRef,
    private renderer: Renderer2
  ) {
    this.rooms = [],
      this.roomtoDisplay = this.roomtoDisplay;
    this.blogs = [],
      this.blogtoDisplay = this.blogs;

    this.roomSearchForm = this.fb.group({
      peopleNumber: '',
      roomTypeId: ''
    })
  }

  ngOnInit(): void {
    this.apiService.searchRoom().subscribe((data: any) => {
      this.maxPerson = data.maxPerson;
      this.maxPrice = data.maxPrice;
      this.roomTypeName = data.roomTypes;
      this.serviceAttachs = data.serviceAttachs;
      this.maxPersonArray = Array.from({length: this.maxPerson}, (v, k) => k+1);
      this.roomSearchForm.controls["peopleNumber"].setValue(0);
      this.roomSearchForm.controls["roomTypeId"].setValue(0);
    });

    this.apiService.getRoomOnSale().subscribe(
      (rooms: Room[]) => {
        this.rooms = rooms;
        this.discountRoom = rooms;
      },
      (error: any) => {
        console.log(error);
      }
    );

    this.apiService.getBlogs().subscribe((res: any) => {
      for (let b of res) {
        this.blogs.unshift(b);
      }
      this.blogtoDisplay = this.blogs;
    });
  }



  navigateToPage(url: string) {
    window.location.href = url;
    window.scrollTo(0, 0);
  }
  onSubmit() {
    const checkInValue = new Date(this.checkIn.value!)
    const checkOutValue = new Date(this.checkOut.value!)
    const now = new Date(new Date().setHours(0,0,0));

    if(checkInValue < now || checkOutValue < now || checkOutValue <= checkInValue) {
      this.toast.error("Time cannot be less than current date");
    }else{
      var checkInDate = new Date(checkInValue);
      checkInDate = new Date(checkInDate.setHours(7,0,0));
      var checkOutDate = new Date(checkOutValue);
      checkOutDate = new Date(checkOutDate.setHours(7,0,0));
      const numberOfNights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      localStorage.setItem('loadPage', 'true');
      this.router.navigate( ['/room-listing', checkInDate.toISOString(), checkOutDate.toISOString(), this.roomSearchForm.controls["peopleNumber"].value, this.roomSearchForm.controls["roomTypeId"].value]);
    }
  }

}

