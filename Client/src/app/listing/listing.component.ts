import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ApiService } from '../_service/api.service';
import { Router } from '@angular/router';
import { AuthService } from '../_service/auth.service';
import { SearchService } from '../_service/search.service';
import { Room } from '../models/room.model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { param } from 'jquery';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment.development';
import { Booking } from '../models/booking.model ';
import { userProfile } from '../models/userProfile.model';
import { SearchRoom } from '../models/searchRoom.model';
import { window } from 'rxjs';
const today = new Date();
const month = today.getMonth();
const year = today.getFullYear();
interface RoomType {
  id: number;
  typeName: string;
  maxPerson: number;
}
@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.scss'],
})
export class ListingComponent implements OnInit {
  results!: number;
  page: number = 1;
  count: number = 0;
  filteredRooms!: Room[];
  tableSize: number = 5;
  tableSizes: any = [3, 6, 9, 12];
  maxPerson!: any;
  maxPrice = 0;
  roomTypes: RoomType[] = [];
  serviceAttachs = [];
  roomSearchForm!: FormGroup;
  roomTypeName: RoomType[] = [];
  peopleNumberOptions: any;
  checkInDate: any;
  checkOutDate: any;
  checkInDateString: any;
  checkOutDateString: any;
  peopleNumber: any;
  roomTypeId: any;

  constructor(
    private roomService: ApiService,
    private router: Router,
    private http: HttpClient,
    private apiService: ApiService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private toast: ToastrService
  ) {
    this.roomSearchForm = this.fb.group({
      peopleNumber: '',
      roomTypeId: '',
    });
  }

  date = new FormControl(new Date());
  checkIn = new FormControl(new Date().toISOString());
  checkOut = new FormControl(new Date().toISOString());
  ngOnInit(): void {
    if (localStorage.getItem('loadPage') == 'true') {
      location.reload();
      localStorage.removeItem('loadPage');
    }
    this.apiService.searchRoom().subscribe((data: any) => {
      this.maxPerson = data.maxPerson;
      this.maxPrice = data.maxPrice;
      this.roomTypeName = data.roomTypes;
      this.serviceAttachs = data.serviceAttachs;
    });

    this.checkInDate = new Date(
      new Date(this.route.snapshot.paramMap.get('checkIn')!).setHours(7, 0, 0)
    );
    this.checkOutDate = new Date(
      new Date(this.route.snapshot.paramMap.get('checkOut')!).setHours(7, 0, 0)
    );
    this.peopleNumber = this.route.snapshot.paramMap.get('person');
    this.roomTypeId = this.route.snapshot.paramMap.get('roomTypeId');
    this.getRoomSearch();
    this.checkInDateString = this.checkInDate.toISOString();
    this.checkOutDateString = this.checkOutDate.toISOString();

    this.checkIn.setValue(this.checkInDate.toISOString());

    this.checkOut.setValue(this.checkOutDate.toISOString());

    this.peopleNumberOptions = Array.from(
      { length: this.maxPerson },
      (v, k) => k + 1
    );

    this.roomSearchForm.controls['peopleNumber'].setValue(
      Number.parseInt(this.peopleNumber)
    );
    this.roomSearchForm.controls['roomTypeId'].setValue(
      Number.parseInt(this.roomTypeId)
    );
    this.sortMaxPersonArrayDescending();
  }
  getFullRooms() {
    this.apiService.searchRoom().subscribe((data: any) => {
      this.maxPerson = Array(data.maxPerson)
        .fill(1)
        .map((x, i) => i + 1);
      this.maxPrice = data.maxPrice;
      console.log(this.maxPrice);

      this.roomTypes = data.roomTypes;
      this.serviceAttachs = data.serviceAttachs;
    });

    this.apiService.getRooms().subscribe(
      (rooms: Room[]) => {
        this.filteredRooms = rooms;
      },
      (error: any) => {
        console.log(error);
      }
    );
  }
  sortMaxPersonArrayDescending() {
    this.maxPersonArray.sort((a, b) => a - b);
  }

  get maxPersonArray(): number[] {
    return Array.from({ length: this.maxPerson }, (_, i) => this.maxPerson - i);
  }

  getRooms() {
    this.roomService.getRooms().subscribe((res: any) => {
      this.filteredRooms = res;
    });
  }

  getRoomDetail(id: string) {
    this.roomService.getRoomDetail(id).subscribe((res: any) => {
      localStorage.setItem('bookedRoom', JSON.stringify(res));
    });
  }

  getRoomSearch() {
    var payLoad = {
      checkIn: this.checkInDate,
      checkOut: this.checkOutDate,
      price: 0,
      typeRoomId: this.roomTypeId == '' ? 0 : this.roomTypeId,
      star: 0,
      peopleNumber: this.peopleNumber == '' ? 0 : this.peopleNumber,
    };
    this.http
      .post<Room[]>(environment.BASE_URL_API + `/user/room/get-all-by`, payLoad)
      .subscribe(
        (res) => {
          this.filteredRooms = res;
        },
        (_err) => {
          this.toast.error(_err.message);
        }
      );
  }

  routePage() {
    this.router.navigate(['/room-detail/{{room.id}}']);
  }
  onTableDataChange(event: any) {
    this.page = event;
    this.getRooms();
  }
  onTableSizeChange(event: any): void {
    this.tableSize = event.target.value;
    this.page = 1;
    this.getRooms();
  }
  deleteData() {
    // Xóa dữ liệu khỏi URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { data: null },
      queryParamsHandling: 'merge',
    });
  }

  clear()
  {
    this.roomSearchForm.controls['peopleNumber'].setValue(0);
    this.roomSearchForm.controls['roomTypeId'].setValue(0);
    $('.price_search').val(10000000);
    $('.max_price').html('10000000');
    $('.noUi-origin.noUi-background').attr('style', 'left: 100%');
    $('.single-shop-left .item.active').removeClass('active');
  }

  onSubmit() {
    var star = 0;
    var starTemp = $('.single-shop-left .item.active').data('value');
    if (starTemp != undefined) {
      star = starTemp;
    }

    const roomTypeId = this.roomSearchForm.value.roomTypeId;
    const peopleNumber = this.roomSearchForm.value.peopleNumber;

    const checkInValue = this.checkIn.value;
    const checkOutValue = this.checkOut.value;

    if (!checkInValue || !checkOutValue) {
      // Handle error when check-in or check-out values are not set
      return;
    }
    var checkInDate = new Date(checkInValue);
    checkInDate = new Date(checkInDate.setHours(7, 0, 0));
    var checkOutDate = new Date(checkOutValue);
    checkOutDate = new Date(checkOutDate.setHours(7, 0, 0));
    const numberOfNights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    4;
    this.checkInDateString = checkInDate.toISOString();
    this.checkOutDateString = checkOutDate.toISOString();

    var price = $('.price_search').val();

    const numDays = numberOfNights;
    var payLoad = {
      checkIn: checkInDate.toISOString(),
      checkOut: checkOutDate.toISOString(),
      price: price,
      typeRoomId: roomTypeId == '' ? 0 : roomTypeId,
      star: star,
      peopleNumber: peopleNumber == '' ? 0 : peopleNumber,
    };
    console.log(payLoad);


    if (numDays > 0) {
      this.deleteData;
      this.http
        .post<Room[]>(
          environment.BASE_URL_API + `/user/room/get-all-by`,
          payLoad
        )
        .subscribe(
          (res) => {
            this.filteredRooms = res;
            this.router.navigate([
              '/room-listing',
              checkInDate.toISOString(),
              checkOutDate.toISOString(),
              this.roomSearchForm.controls['peopleNumber'].value,
              this.roomSearchForm.controls['roomTypeId'].value,
            ]);
          },
          (_err) => {
            console.log(_err);
          }
        );
    } else {
      this.toast.error('You have to select to Checkout day!');
    }
  }

  bookingRoom(idRoom: any) {
    const checkInValue = this.checkIn.value;
    const checkOutValue = this.checkOut.value;
    if (!checkInValue || !checkOutValue) {
      return;
    }
    const checkInDate = new Date(checkInValue);
    const checkOutDate = new Date(checkOutValue);
    const numberOfNights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    var userProfileLocal = new userProfile();
    if (localStorage.getItem('user_profile')!.length > 0) {
      let result = localStorage.getItem('user_profile')!;
      userProfileLocal = JSON.parse(result) as userProfile;
    }
    var payLoad = new Booking();
    payLoad.startDate = checkInDate;
    payLoad.endDate = checkOutDate;
    payLoad.roomId = idRoom;
    payLoad.numberOfDay = numberOfNights;
    payLoad.name = userProfileLocal.userName;
    payLoad.email = userProfileLocal.email;
    payLoad.phoneNumber = userProfileLocal.phoneNumber;
    payLoad.address = userProfileLocal.address;

    this.http
      .post<any>(`${environment.BASE_URL_API}/user/reservation/create`, payLoad)
      .subscribe(
        (res) => {
          this.toast.success(res.message);
          this.router.navigate(['/checkout', res.reservationId]);
        },
        (_err) => {
          const wrongtime = _err.error.title;
          if (wrongtime) {
            this.toast.error(_err.error.title);
          } else {
            this.toast.error(_err.error.message);
          }
        }
      );
  }
}
