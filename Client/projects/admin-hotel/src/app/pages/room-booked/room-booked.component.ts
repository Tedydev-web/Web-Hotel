import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-room-booked',
  templateUrl: './room-booked.component.html',
  styleUrls: ['./room-booked.component.css']
})
export class RoomBookedComponent implements OnInit {
  // Data models
  allRooms: RoomBookedModel[] = [];
  filteredRooms: RoomBookedModel[] = [];
  selectedRoom: RoomBookedModel | null = null;
  roomTypes: any[] = [];
  availableServices: any[] = [];
  
  // Search and filters
  searchTerm: string = '';
  roomTypeFilter: string = 'all';
  dateFrom: string = '';
  dateTo: string = '';
  showFilters: boolean = false;
  
  // View settings
  viewMode: 'card' | 'table' = 'card';
  
  // Pagination
  pageSize: number = 12;
  currentPage: number = 1;
  totalPages: number = 1;
  
  // Forms
  serviceForm: FormGroup;
  extendForm: FormGroup;
  
  // Loading state
  isLoading: boolean = false;

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.serviceForm = this.fb.group({
      serviceId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      notes: ['']
    });

    this.extendForm = this.fb.group({
      additionalDays: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.loadBookedRooms();
    this.loadRoomTypes();
    this.loadAvailableServices();
  }

  // Data loading
  loadBookedRooms() {
    this.isLoading = true;
    this.http.get<RoomBookedModel[]>(environment.BASE_URL_API + '/v2/admin/room-booked/get-all')
      .subscribe(
        (res: any) => {
          this.allRooms = res;
          this.filteredRooms = [...this.allRooms];
          this.totalPages = Math.ceil(this.filteredRooms.length / this.pageSize);
          this.applyPagination();
          this.isLoading = false;
        },
        (err) => {
          console.log(err);
          this.isLoading = false;
        }
      );
  }

  loadRoomTypes() {
    this.http.get(environment.BASE_URL_API + '/v2/admin/room-type/get-all')
      .subscribe(
        (res: any) => {
          this.roomTypes = res;
        },
        (err) => {
          console.log(err);
        }
      );
  }

  loadAvailableServices() {
    this.http.get(environment.BASE_URL_API + '/v2/admin/service/get-all')
      .subscribe(
        (res: any) => {
          this.availableServices = res;
        },
        (err) => {
          console.log(err);
        }
      );
  }

  // View actions
  viewRoomDetails(id: string) {
    this.isLoading = true;
    this.http.get<RoomBookedModel>(environment.BASE_URL_API + `/v2/admin/room-booked/get-by-id?id=${id}`)
      .subscribe(
        (res) => {
          this.selectedRoom = res;
          this.isLoading = false;
        },
        (err) => {
          console.log(err);
          this.isLoading = false;
        }
      );
  }

  viewServiceUsage(id: string) {
    this.viewRoomDetails(id);
    setTimeout(() => {
      document.getElementById('service-tab')?.click();
    }, 500);
  }

  addService(id: string | undefined) {
    if (!id) return;
    
    this.serviceForm.reset({
      serviceId: '',
      quantity: 1,
      notes: ''
    });
    
    // Hide the room detail modal
    document.getElementById('room-detail-modal-close')?.click();
    
    // Show the service modal
    setTimeout(() => {
      const serviceModal = document.getElementById('service-modal');
      if (serviceModal) {
        // @ts-ignore
        const bsModal = new bootstrap.Modal(serviceModal);
        bsModal.show();
      }
    }, 500);
  }

  submitService() {
    if (this.serviceForm.invalid || !this.selectedRoom) {
      return;
    }

    this.isLoading = true;
    const payload = {
      roomBookedId: this.selectedRoom.id,
      serviceId: this.serviceForm.value.serviceId,
      quantity: this.serviceForm.value.quantity,
      notes: this.serviceForm.value.notes
    };

    this.http.post(environment.BASE_URL_API + '/v2/admin/room-service/add', payload)
      .subscribe(
        (res) => {
          this.isLoading = false;
          document.getElementById('service-modal-close')?.click();
          // Refresh room details
          this.viewRoomDetails(this.selectedRoom!.id);
        },
        (err) => {
          console.log(err);
          this.isLoading = false;
          alert('Đã xảy ra lỗi khi thêm dịch vụ');
        }
      );
  }

  extendStay(id: string | undefined) {
    if (!id) return;
    
    this.extendForm.reset({
      additionalDays: 1
    });
    
    if (!this.selectedRoom) {
      this.viewRoomDetails(id);
    }
    
    // Hide the room detail modal if it's open
    document.getElementById('room-detail-modal-close')?.click();
    
    // Show the extend modal
    setTimeout(() => {
      const extendModal = document.getElementById('extend-modal');
      if (extendModal) {
        // @ts-ignore
        const bsModal = new bootstrap.Modal(extendModal);
        bsModal.show();
      }
    }, 500);
  }

  submitExtendStay() {
    if (this.extendForm.invalid || !this.selectedRoom) {
      return;
    }

    this.isLoading = true;
    const payload = {
      roomBookedId: this.selectedRoom.id,
      additionalDays: this.extendForm.value.additionalDays
    };

    this.http.post(environment.BASE_URL_API + '/v2/admin/room-booked/extend', payload)
      .subscribe(
        (res) => {
          this.isLoading = false;
          document.getElementById('extend-modal-close')?.click();
          // Refresh data
          this.loadBookedRooms();
        },
        (err) => {
          console.log(err);
          this.isLoading = false;
          alert('Đã xảy ra lỗi khi gia hạn lưu trú');
        }
      );
  }

  // Filter functions
  toggleFilterSection() {
    this.showFilters = !this.showFilters;
  }

  clearFilters() {
    this.searchTerm = '';
    this.roomTypeFilter = 'all';
    this.dateFrom = '';
    this.dateTo = '';
    this.filteredRooms = [...this.allRooms];
    this.totalPages = Math.ceil(this.filteredRooms.length / this.pageSize);
    this.currentPage = 1;
    this.applyPagination();
  }

  applyFilters() {
    let filtered = [...this.allRooms];
    
    // Filter by search term
    if (this.searchTerm.trim()) {
      const searchTerm = this.searchTerm.toLowerCase();
      filtered = filtered.filter((item) =>
        item.roomNumber.toLowerCase().includes(searchTerm) ||
        item.name.toLowerCase().includes(searchTerm) ||
        item.customerName.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filter by room type
    if (this.roomTypeFilter !== 'all') {
      filtered = filtered.filter(item => item.roomTypeId === this.roomTypeFilter);
    }
    
    // Filter by date range (check-in date)
    if (this.dateFrom) {
      const fromDate = new Date(this.dateFrom);
      filtered = filtered.filter(item => {
        const startDate = new Date(item.startDate);
        return startDate >= fromDate;
      });
    }
    
    // Filter by date range (check-out date)
    if (this.dateTo) {
      const toDate = new Date(this.dateTo);
      toDate.setHours(23, 59, 59);
      filtered = filtered.filter(item => {
        const endDate = new Date(item.endDate);
        return endDate <= toDate;
      });
    }
    
    this.filteredRooms = filtered;
    this.totalPages = Math.ceil(this.filteredRooms.length / this.pageSize);
    this.currentPage = 1;
    this.applyPagination();
  }

  // Pagination
  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.applyPagination();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    
    if (this.totalPages <= 5) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (this.currentPage >= this.totalPages - 2) {
        for (let i = this.totalPages - 4; i <= this.totalPages; i++) {
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
    const endIndex = Math.min(startIndex + this.pageSize, this.filteredRooms.length);
    this.filteredRooms = this.filteredRooms.slice(0, this.filteredRooms.length);
  }

  // View mode
  setViewMode(mode: 'card' | 'table') {
    this.viewMode = mode;
  }

  // Sort function
  sortBy(criteria: string) {
    let sorted = [...this.filteredRooms];
    
    switch (criteria) {
      case 'checkinEarliest':
        sorted.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        break;
      case 'checkinLatest':
        sorted.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        break;
      case 'checkoutEarliest':
        sorted.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
        break;
      case 'checkoutLatest':
        sorted.sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
        break;
    }
    
    this.filteredRooms = sorted;
  }

  // Export to Excel
  exportToExcel() {
    const data = this.allRooms.map(item => {
      return {
        'Phòng số': item.roomNumber,
        'Loại phòng': item.name,
        'Khách hàng': item.customerName,
        'Nhận phòng': new Date(item.startDate).toLocaleDateString('vi-VN'),
        'Trả phòng': new Date(item.endDate).toLocaleDateString('vi-VN'),
        'Số ngày còn lại': this.getRemainingDays(item.endDate),
        'Giá phòng': item.price,
        'Tiền cọc': item.deposit,
        'Email': item.email,
        'Số điện thoại': item.phoneNumber
      };
    });
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Phòng đang được đặt');
    
    // Export Excel file
    XLSX.writeFile(workbook, 'phong-dang-duoc-dat.xlsx');
  }

  // Dashboard and utility functions
  getActiveBookingsCount(): number {
    return this.allRooms.length;
  }

  getActiveGuestsCount(): number {
    // Sum the number of guests (assuming each booking has at least one guest)
    return this.allRooms.reduce((sum, room) => sum + (room.numberOfGuests || 1), 0);
  }

  getCheckoutsToday(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return this.allRooms.filter(room => {
      const checkoutDate = new Date(room.endDate);
      checkoutDate.setHours(0, 0, 0, 0);
      return checkoutDate.getTime() === today.getTime();
    }).length;
  }

  getActiveRevenueTotal(): number {
    return this.allRooms.reduce((sum, room) => {
      const days = this.getRemainingDays(room.endDate);
      return sum + (days * room.price);
    }, 0);
  }

  getRemainingDays(endDate: string | Date): number {
    const end = new Date(endDate);
    const today = new Date();
    
    // Reset hours to get accurate day difference
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    // Calculate the difference in days
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }

  getStayProgress(startDate: string | Date, endDate: string | Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    
    // Calculate total duration of stay
    const totalStayMs = end.getTime() - start.getTime();
    const totalStayDays = Math.ceil(totalStayMs / (1000 * 60 * 60 * 24));
    
    // Calculate elapsed duration
    const elapsedMs = today.getTime() - start.getTime();
    const elapsedDays = Math.ceil(elapsedMs / (1000 * 60 * 60 * 24));
    
    // Calculate progress percentage
    const progress = Math.round((elapsedDays / totalStayDays) * 100);
    
    return Math.min(Math.max(0, progress), 100); // Ensure progress is between 0-100
  }

  getServiceTotal(): number {
    if (!this.selectedRoom || !this.selectedRoom.services) {
      return 0;
    }
    
    return this.selectedRoom.services.reduce((total: number, service: any) => {
      return total + (service.price * service.quantity);
    }, 0);
  }

  getExtendedDate(): Date | null {
    if (!this.selectedRoom) {
      return null;
    }
    
    const additionalDays = this.extendForm.value.additionalDays || 0;
    const currentEndDate = new Date(this.selectedRoom.endDate);
    const newEndDate = new Date(currentEndDate);
    newEndDate.setDate(currentEndDate.getDate() + additionalDays);
    
    return newEndDate;
  }

  getAdditionalFee(): number {
    if (!this.selectedRoom) {
      return 0;
    }
    
    const additionalDays = this.extendForm.value.additionalDays || 0;
    return additionalDays * this.selectedRoom.price;
  }

  refreshData() {
    this.loadBookedRooms();
  }
}

// Room Booked Model
export class RoomBookedModel {
  id!: string;
  roomId!: string;
  roomNumber!: string;
  roomTypeId!: string;
  name!: string;
  startDate!: string;
  endDate!: string;
  price!: number;
  deposit!: number;
  reservationId!: string;
  customerId!: string;
  customerName!: string;
  email!: string;
  phoneNumber!: string;
  address!: string;
  numberOfGuests?: number;
  paymentMethod?: string;
  services?: any[];
}