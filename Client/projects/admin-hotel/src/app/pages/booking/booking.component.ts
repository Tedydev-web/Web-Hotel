import { Component, OnInit, PipeTransform } from '@angular/core';
import { DateFilterFn } from '@angular/material/datepicker';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { timeout } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/_service/api.service';
import { ServiceAttach } from '../../models/serviceAttach.model';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent implements OnInit{
  // Dữ liệu đặt phòng
  reservationGetAll: ReservationModel[] = [];
  reservationFilter: ReservationModel[] = [];
  filteredReservations: ReservationModel[] = [];
  reservationGetById!: ReservationModel;
  searchBooking: string = '';

  // Phân trang
  pageSize: number = 10;
  currentPage: number = 1;
  totalPages: number = 1;

  // Bộ lọc
  showFilters: boolean = false;
  statusFilter: string = 'all';
  dateFrom: string = '';
  dateTo: string = '';
  
  // Chế độ xem
  viewMode: 'card' | 'table' = 'card';
  
  // Form đặt phòng
  bookingForm!: FormGroup;
  availableRooms: any[] = [];
  
  // Loading state
  isLoading: boolean = false;

  constructor(private http: HttpClient, private fb: FormBuilder, private api: ApiService) {
    this.initBookingForm();
  }

  ngOnInit(): void {
    this.GetReservationAll();
    this.loadAvailableRooms();
    
    // Theo dõi thay đổi số ngày để tự động tính ngày kết thúc
    this.bookingForm.get('startDate')?.valueChanges.subscribe(() => {
      this.updateEndDate();
    });
    
    this.bookingForm.get('numberOfDay')?.valueChanges.subscribe(() => {
      this.updateEndDate();
    });
  }

  initBookingForm() {
    this.bookingForm = this.fb.group({
      startDate: [new Date().toISOString().slice(0, 16), Validators.required],
      endDate: [{value: '', disabled: true}],
      roomId: ['', Validators.required],
      numberOfDay: [1, [Validators.required, Validators.min(1)]],
      email: ['', [Validators.required, Validators.email]],
      name: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      address: ['', Validators.required],
      paymentMethod: ['momo', Validators.required],
    });
  }

  GetReservationAll() {
    this.isLoading = true;
    this.http.get<ReservationModel[]>(environment.BASE_URL_API+"/v2/admin/reservation/get-all")
    .subscribe(
      (res: any)=>{
        this.reservationGetAll = res;
        this.reservationFilter = res;
        this.filteredReservations = res;
        this.totalPages = Math.ceil(this.filteredReservations.length / this.pageSize);
        this.applyPagination();
        this.isLoading = false;
      },
      (err) => {
        console.log(err);
        this.isLoading = false;
      }
    )
  }

  GetReservationById(id: string) {
    this.isLoading = true;
    this.http.get<ReservationModel>(environment.BASE_URL_API+`/v2/admin/reservation/get-by-id?id=${id}`)
    .subscribe(
      (res)=>{
        this.reservationGetById = res;
        this.isLoading = false;
      },
      (err) => {
        console.log(err);
        this.isLoading = false;
      }
    )
  }

  searchBookings() {
    if (!this.searchBooking.trim()) {
      this.filteredReservations = [...this.reservationFilter];
      return;
    }
    
    // Chuyển đổi từ khóa tìm kiếm thành chữ thường
    const searchTerm = this.searchBooking.toLowerCase();
    
    // Lọc các đặt phòng dựa trên từ khóa tìm kiếm
    this.filteredReservations = this.reservationFilter.filter((item) =>
      item.roomNumber.toLowerCase().includes(searchTerm) ||
    item.name.toLowerCase().includes(searchTerm) ||
    item.id.toLowerCase().includes(searchTerm) 
    );
    
    this.totalPages = Math.ceil(this.filteredReservations.length / this.pageSize);
    this.currentPage = 1;
    this.applyPagination();
  }

  clearSearch() {
    this.searchBooking = ''; // Xóa từ khóa tìm kiếm
    this.filteredReservations = [...this.reservationFilter];
    this.totalPages = Math.ceil(this.filteredReservations.length / this.pageSize);
    this.currentPage = 1;
    this.applyPagination();
  }

  toggleFilterSection() {
    this.showFilters = !this.showFilters;
  }

  clearFilters() {
    this.searchBooking = '';
    this.statusFilter = 'all';
    this.dateFrom = '';
    this.dateTo = '';
    this.filteredReservations = [...this.reservationFilter];
    this.totalPages = Math.ceil(this.filteredReservations.length / this.pageSize);
    this.currentPage = 1;
    this.applyPagination();
  }

  applyFilters() {
    let filtered = [...this.reservationFilter];
    
    // Lọc theo từ khóa tìm kiếm
    if (this.searchBooking.trim()) {
      const searchTerm = this.searchBooking.toLowerCase();
      filtered = filtered.filter((item) =>
        item.roomNumber.toLowerCase().includes(searchTerm) ||
        item.name.toLowerCase().includes(searchTerm) ||
        item.id.toLowerCase().includes(searchTerm)
      );
    }
    
    // Lọc theo trạng thái
    if (this.statusFilter !== 'all') {
      const status = this.statusFilter === 'true';
      filtered = filtered.filter(item => item.status === status);
    }
    
    // Lọc theo ngày bắt đầu
    if (this.dateFrom) {
      const fromDate = new Date(this.dateFrom);
      filtered = filtered.filter(item => {
        const startDate = new Date(item.startDate);
        return startDate >= fromDate;
      });
    }
    
    // Lọc theo ngày kết thúc
    if (this.dateTo) {
      const toDate = new Date(this.dateTo);
      toDate.setHours(23, 59, 59);
      filtered = filtered.filter(item => {
        const endDate = new Date(item.endDate);
        return endDate <= toDate;
      });
    }
    
    this.filteredReservations = filtered;
    this.totalPages = Math.ceil(this.filteredReservations.length / this.pageSize);
    this.currentPage = 1;
    this.applyPagination();
  }

  // Phân trang
  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.applyPagination();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const totalPages = Math.ceil(this.filteredReservations.length / this.pageSize);
    
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (this.currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = this.currentPage - 2; i <= this.currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  }

  applyPagination() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.filteredReservations = this.filteredReservations.slice(startIndex, startIndex + this.pageSize);
  }

  // Chế độ xem
  setViewMode(mode: 'card' | 'table') {
    this.viewMode = mode;
  }

  // Sắp xếp
  sortBy(criteria: string) {
    let sorted = [...this.filteredReservations];
    
    switch (criteria) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'priceHighest':
        sorted.sort((a, b) => b.reservationPrice - a.reservationPrice);
        break;
      case 'priceLowest':
        sorted.sort((a, b) => a.reservationPrice - b.reservationPrice);
        break;
    }
    
    this.filteredReservations = sorted;
  }

  // Xuất dữ liệu
  exportData() {
    const data = this.reservationFilter.map(item => {
      return {
        'ID': item.id,
        'Phòng': item.roomNumber,
        'Khách hàng': item.name,
        'Ngày bắt đầu': new Date(item.startDate).toLocaleDateString('vi-VN'),
        'Ngày kết thúc': new Date(item.endDate).toLocaleDateString('vi-VN'),
        'Số ngày': item.numberOfDay,
        'Giá phòng': item.roomPrice,
        'Tổng tiền': item.reservationPrice,
        'Trạng thái': item.status ? 'Đã thanh toán' : 'Chưa thanh toán',
        'Ngày tạo': new Date(item.createdAt).toLocaleDateString('vi-VN')
      };
    });
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách đặt phòng');
    
    // Xuất file Excel
    XLSX.writeFile(workbook, 'danh-sach-dat-phong.xlsx');
  }

  // Các thao tác đặt phòng
  loadAvailableRooms() {
    this.http.get(environment.BASE_URL_API + '/v2/admin/room/available-rooms')
      .subscribe(
        (res: any) => {
          this.availableRooms = res;
        },
        err => console.log(err)
      );
  }

  updateEndDate() {
    const startDate = this.bookingForm.get('startDate')?.value;
    const numberOfDays = this.bookingForm.get('numberOfDay')?.value;
    
    if (startDate && numberOfDays) {
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + parseInt(numberOfDays));
      
      this.bookingForm.get('endDate')?.setValue(end.toISOString().slice(0, 16));
    }
  }

  calculateTotal(): number {
    const roomId = this.bookingForm.get('roomId')?.value;
    const numberOfDays = this.bookingForm.get('numberOfDay')?.value || 0;
    
    if (!roomId || !numberOfDays) return 0;
    
    const selectedRoom = this.availableRooms.find(room => room.id === roomId);
    if (!selectedRoom) return 0;
    
    return selectedRoom.currentPrice * numberOfDays;
  }

  createBooking() {
    if (this.bookingForm.invalid) {
      // Đánh dấu tất cả các trường để hiển thị lỗi
      Object.keys(this.bookingForm.controls).forEach(key => {
        const control = this.bookingForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
      return;
    }
    
    this.isLoading = true;
    this.http.post(environment.BASE_URL_API + '/v2/admin/reservation/create', this.bookingForm.value)
      .subscribe(
        (res: any) => {
          this.isLoading = false;
          alert('Đặt phòng thành công');
          this.GetReservationAll();
          this.bookingForm.reset();
          this.initBookingForm();
          // Đóng modal
          document.getElementById('booking-modal-close')?.click();
        },
        err => {
          console.log(err);
          this.isLoading = false;
          alert('Đã xảy ra lỗi khi đặt phòng');
        }
      );
  }

  updateStatus(id: string, newStatus: boolean) {
    this.isLoading = true;
    this.http.put(environment.BASE_URL_API + `/v2/admin/reservation/update-status?id=${id}&status=${newStatus}`, {})
      .subscribe(
        (res: any) => {
          this.isLoading = false;
          alert('Cập nhật trạng thái thành công');
          this.GetReservationAll();
          // Đóng modal nếu đang mở
          document.getElementById('detail-modal-close')?.click();
        },
        err => {
          console.log(err);
          this.isLoading = false;
          alert('Đã xảy ra lỗi khi cập nhật trạng thái');
        }
      );
  }

  printBooking(id: string) {
    // In hóa đơn đặt phòng
    window.open(environment.BASE_URL_API + `/v2/reservation/print?id=${id}`, '_blank');
  }

  // Dashboard metrics
  getTotalRevenue(): number {
    return this.reservationFilter
      .filter(item => item.status === true)
      .reduce((total, item) => total + item.reservationPrice, 0);
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
  serviceAttachs!: ServiceAttach
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
