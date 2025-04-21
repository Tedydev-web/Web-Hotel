import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Room } from "../../models/room.model";
import { ApiService } from "../../_service/api.service";
import { PaymentApi } from "../../_service/payment.service";
import { ReservationApi } from "../../_service/reservation.service";
import { RoomApi } from "../../_service/room.service";
import { DateFilterFn } from '@angular/material/datepicker';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { ServiceAttach } from '../../models/serviceAttach.model';
import * as XLSX from 'xlsx';
import { formatDate } from "@angular/common";

@Component({
    selector: "app-reservation",
    templateUrl: "./reservation.component.html",
    styleUrls: ["./reservation.component.css"],
})
export class ReservationComponent implements OnInit {
    formReservation!: FormGroup;
    formSearch!: FormGroup;
    reservationForm!: FormGroup;
    searchRoomForm!: FormGroup;
    rooms!: Room[];
    dataSearch: any = {
        maxPerson: "",
        maxPrice: "",
        roomTypes: "",
        serviceAttachs: "",
    };
    checkSearchData: any;
    reservationGetAll: ReservationModel[] = [];
    reservationFilter: ReservationModel[] = [];
    filteredReservations: ReservationModel[] = [];
    reservationGetById!: ReservationModel;
    searchReservation: string = '';
    pageSize: number = 10;
    currentPage: number = 1;
    totalPages: number = 1;
    showFilters: boolean = false;
    statusFilter: string = 'all';
    dateFrom: string = '';
    dateTo: string = '';
    viewMode: 'card' | 'table' = 'card';
    availableRooms: any[] = [];
    isLoading: boolean = false;
    selectedRoom: any = null;
    
    // Thêm các thuộc tính mới cho tìm kiếm phòng
    searchedRooms: any[] = [];
    isSearching: boolean = false;
    hasSearched: boolean = false;
    roomTypes: any[] = [];
    maxPersonArray: number[] = [];
    numberOfDays: number = 1;
    minDate: string = '';

    constructor(
        private reservation: ReservationApi,
        private payment: PaymentApi,
        private fb: FormBuilder,
        private roomService: ApiService,
        private router: Router,
        private room: RoomApi,
        private http: HttpClient
    ) {
        // Lấy ngày hiện tại để làm giá trị tối thiểu cho ngày bắt đầu
        const today = new Date();
        this.minDate = formatDate(today, 'yyyy-MM-dd', 'en-US');
        
        this.formReservation = this.fb.group({
            roomId: ["", [Validators.required]],
            roomPrice: ["", [Validators.required]],
            startDate: [new Date(), [Validators.required]],
            endDate: [new Date(), [Validators.required]],
            name: ["", [Validators.required]],
            phoneNumber: ["", [Validators.required, Validators.pattern("^[0-9]*$")]],
            email: ["", [Validators.required, Validators.email]],
            address: ["", [Validators.required]],
            numberOfDay: ["", [Validators.required]],
            numberOfPeople: ["", [Validators.required]],
            payType: ["", [Validators.required]],
        });

        this.formSearch = this.fb.group({
            roomTypes: [""],
            maxPerson: [""],
            maxPrice: [""],
            serviceAttachs: [""],
        });
        
        // Form tìm kiếm phòng
        this.searchRoomForm = this.fb.group({
            checkIn: [formatDate(today, 'yyyy-MM-dd', 'en-US'), Validators.required],
            checkOut: [formatDate(new Date(today.getTime() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd', 'en-US'), Validators.required],
            peopleNumber: ['', Validators.required],
            roomTypeId: [''],
        });
        
        // Form đặt phòng
        this.reservationForm = this.fb.group({
            roomId: ['', Validators.required],
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
            address: ['', Validators.required],
            paymentMethod: ['cash', Validators.required],
            numberOfPeople: [1, [Validators.required, Validators.min(1)]],
        });
    }

    ngOnInit(): void {
        this.checkSearchData = true;
        this.getRooms();
        this.getDataAddSearch();
        this.GetReservationAll();
        this.loadRoomTypes();
        
        // Lắng nghe sự kiện khi ngày bắt đầu hoặc kết thúc thay đổi
        this.searchRoomForm.get('checkIn')?.valueChanges.subscribe(() => {
            this.updateCheckOutMinDate();
            this.calculateNumberOfDays();
        });
        
        this.searchRoomForm.get('checkOut')?.valueChanges.subscribe(() => {
            this.calculateNumberOfDays();
        });
        
        // Lắng nghe sự kiện đóng modal
        document.addEventListener('hidden.bs.modal', (event: any) => {
            if (event.target.id === 'reservation-modal') {
                this.resetForms();
            }
        });
    }

    // Tải danh sách loại phòng và số người tối đa
    loadRoomTypes() {
        this.http.get<any>(environment.BASE_URL_API + '/user/search-room')
            .subscribe(
                (res) => {
                    this.roomTypes = res.roomTypes || [];
                    const maxPerson = res.maxPerson || 10;
                    this.maxPersonArray = Array.from({length: maxPerson}, (_, i) => i + 1);
                },
                (err) => {
                    console.error('Error loading room types:', err);
                }
            );
    }
    
    // Cập nhật ngày trả phòng tối thiểu
    updateCheckOutMinDate() {
        const checkInDate = this.searchRoomForm.get('checkIn')?.value;
        if (checkInDate) {
            const nextDay = new Date(checkInDate);
            nextDay.setDate(nextDay.getDate() + 1);
            const formattedDate = formatDate(nextDay, 'yyyy-MM-dd', 'en-US');
            
            // Nếu ngày trả phòng < ngày nhận phòng + 1 thì cập nhật
            const currentCheckOut = this.searchRoomForm.get('checkOut')?.value;
            if (!currentCheckOut || new Date(currentCheckOut) <= new Date(checkInDate)) {
                this.searchRoomForm.get('checkOut')?.setValue(formattedDate);
            }
        }
    }
    
    // Tính số ngày giữa ngày nhận và trả phòng
    calculateNumberOfDays() {
        const checkInDate = this.searchRoomForm.get('checkIn')?.value;
        const checkOutDate = this.searchRoomForm.get('checkOut')?.value;
        
        if (checkInDate && checkOutDate) {
            const startDate = new Date(checkInDate);
            const endDate = new Date(checkOutDate);
            const timeDiff = endDate.getTime() - startDate.getTime();
            this.numberOfDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            
            if (this.numberOfDays <= 0) {
                this.numberOfDays = 1;
            }
        } else {
            this.numberOfDays = 1;
        }
    }
    
    // Tìm kiếm phòng theo tiêu chí
    searchAvailableRooms() {
        if (this.searchRoomForm.invalid) {
            Object.keys(this.searchRoomForm.controls).forEach(key => {
                const control = this.searchRoomForm.get(key);
                control?.markAsTouched();
            });
            return;
        }
        
        this.isSearching = true;
        this.hasSearched = true;
        
        const searchData = {
            checkIn: new Date(this.searchRoomForm.get('checkIn')?.value),
            checkOut: new Date(this.searchRoomForm.get('checkOut')?.value),
            peopleNumber: this.searchRoomForm.get('peopleNumber')?.value,
            typeRoomId: this.searchRoomForm.get('roomTypeId')?.value || 0,
            price: 0,
            star: 0
        };
        
        this.room.getRoomBySearch(searchData).subscribe(
            (res: any) => {
                this.searchedRooms = res;
                this.isSearching = false;
            },
            (err) => {
                console.error('Error searching rooms:', err);
                this.isSearching = false;
                this.searchedRooms = [];
            }
        );
    }
    
    // Chọn phòng từ kết quả tìm kiếm
    selectRoom(room: any) {
        this.selectedRoom = room;
        
        // Cập nhật form đặt phòng
        this.reservationForm.patchValue({
            roomId: room.id,
            numberOfPeople: this.searchRoomForm.get('peopleNumber')?.value
        });
    }
    
    // Xóa phòng đã chọn để chọn lại
    clearSelectedRoom() {
        this.selectedRoom = null;
    }
    
    // Lấy giá hiển thị (ưu tiên giá khuyến mãi nếu có)
    getDisplayPrice(): number {
        if (!this.selectedRoom) return 0;
        
        return this.selectedRoom.discountPrice > 0 
            ? this.selectedRoom.discountPrice 
            : this.selectedRoom.currentPrice;
    }

    reservationCreate(idRoom: any) {
        const checkInDate = new Date(
            new Date(this.formSearch.controls["checkIn"].value).setHours(
                new Date(this.formSearch.controls["checkIn"].value).getHours() +
                    7
            )
        );
        const checkOutDate = new Date(
            new Date(this.formSearch.controls["checkOut"].value).setHours(
                new Date(
                    this.formSearch.controls["checkOut"].value
                ).getHours() + 7
            )
        );
        const numberOfNights = Math.ceil(
            (checkOutDate.getTime() - checkInDate.getTime()) /
                (1000 * 60 * 60 * 24)
        );
        this.formReservation.patchValue({
            startDate: checkInDate,
            endDate: checkOutDate,
            roomId: idRoom,
            numberOfDay: numberOfNights,
            numberOfPeople: 1,
            name: "",
            email: "",
            phoneNumber: "",
            address: "",
        });

        this.reservation
            .reservationCreate(this.formReservation.value)
            .subscribe(
                (res) => {
                    this.router.navigate([
                        "/checkout",
                        res.reservationId,
                        idRoom,
                    ]);
                },
                (err) => {
                    alert(err.message);
                }
            );
    }

    getDataAddSearch() {
        this.roomService.DataAddToSearch().subscribe((data: any) => {
            this.dataSearch.maxPrice = data.maxPrice;
            this.dataSearch.roomTypes = data.roomTypes;
            this.dataSearch.serviceAttachs = data.serviceAttachs;
            this.dataSearch.maxPerson = Array.from(
                { length: data.maxPerson },
                (v, k) => k + 1
            );
            console.log(this.dataSearch);
        });
    }

    getRooms() {
        this.roomService.getRooms().subscribe((res: any) => {
            this.rooms = res;
        });
    }

    getRoomByDateSearch() {
        this.checkSearchData = false;
        var payLoad = {
            checkIn: this.formSearch.controls["checkIn"].value,
            checkOut: this.formSearch.controls["checkOut"].value,
            price: 0,
            typeRoomId: this.formSearch.controls["roomTypeId"].value,
            star: 0,
            peopleNumber: this.formSearch.controls["peopleNumber"].value,
        };
        this.room.getRoomBySearch(payLoad).subscribe(
            (res) => {
                this.rooms = res;
            },
            (err) => {
                alert(err);
            }
        );
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

    searchReservations() {
        if (!this.searchReservation.trim()) {
            this.filteredReservations = [...this.reservationFilter];
            return;
        }
        
        const searchTerm = this.searchReservation.toLowerCase();
        
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
        this.searchReservation = '';
        this.filteredReservations = [...this.reservationFilter];
        this.totalPages = Math.ceil(this.filteredReservations.length / this.pageSize);
        this.currentPage = 1;
        this.applyPagination();
    }

    toggleFilterSection() {
        this.showFilters = !this.showFilters;
    }

    clearFilters() {
        this.searchReservation = '';
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
        
        if (this.searchReservation.trim()) {
            const searchTerm = this.searchReservation.toLowerCase();
            filtered = filtered.filter((item) =>
                item.roomNumber.toLowerCase().includes(searchTerm) ||
                item.name.toLowerCase().includes(searchTerm) ||
                item.id.toLowerCase().includes(searchTerm)
            );
        }
        
        if (this.statusFilter !== 'all') {
            const status = this.statusFilter === 'true';
            filtered = filtered.filter(item => item.status === status);
        }
        
        if (this.dateFrom) {
            const fromDate = new Date(this.dateFrom);
            filtered = filtered.filter(item => {
                const startDate = new Date(item.startDate);
                return startDate >= fromDate;
            });
        }
        
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
        this.filteredReservations = this.reservationFilter.slice(startIndex, startIndex + this.pageSize);
    }

    setViewMode(mode: 'card' | 'table') {
        this.viewMode = mode;
    }

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
        
        XLSX.writeFile(workbook, 'danh-sach-dat-phong.xlsx');
    }

    loadAvailableRooms() {
        this.isLoading = true;
        this.http.get<any[]>(environment.BASE_URL_API+"/v2/admin/room/get-available-rooms")
        .subscribe(
            (res) => {
                this.availableRooms = res;
                this.isLoading = false;
            },
            (err) => {
                console.error('Error loading available rooms:', err);
                this.isLoading = false;
            }
        );
    }

    calculateTotal(): number {
        if (!this.selectedRoom) {
            return 0;
        }
        
        const price = this.getDisplayPrice();
        return this.numberOfDays * price;
    }

    createReservation() {
        if (this.reservationForm.invalid || !this.selectedRoom) {
            // Đánh dấu tất cả các trường là đã chạm vào để hiển thị lỗi
            Object.keys(this.reservationForm.controls).forEach(key => {
                const control = this.reservationForm.get(key);
                control?.markAsTouched();
            });
            return;
        }
        
        this.isLoading = true;
        
        const paymentMethod = this.reservationForm.get('paymentMethod')?.value;
        
        // Lấy ngày từ form tìm kiếm
        const startDate = new Date(this.searchRoomForm.get('checkIn')?.value);
        const endDate = new Date(this.searchRoomForm.get('checkOut')?.value);
        
        const reservationData = {
            roomId: this.selectedRoom.id,
            startDate: startDate,
            endDate: endDate,
            numberOfDay: this.numberOfDays,
            numberOfPeople: this.reservationForm.get('numberOfPeople')?.value,
            name: this.reservationForm.get('name')?.value,
            email: this.reservationForm.get('email')?.value,
            phoneNumber: this.reservationForm.get('phoneNumber')?.value,
            address: this.reservationForm.get('address')?.value,
        };
        
        this.reservation.reservationCreate(reservationData).subscribe(
            (res) => {
                if (paymentMethod === 'momo' || paymentMethod === 'vnpay') {
                    this.processPayment(res.reservationId, paymentMethod);
                } else if (paymentMethod === 'cash') {
                    // Xử lý thanh toán tiền mặt
                    this.processCashPayment(res.reservationId);
                } else {
                    // Đóng modal
                    document.getElementById('reservation-modal-close')?.click();
                    
                    // Tải lại danh sách đặt phòng
                    this.GetReservationAll();
                    this.isLoading = false;
                    
                    // Hiển thị thông báo thành công
                    alert('Tạo đơn đặt phòng thành công!');
                }
            },
            (err) => {
                console.error('Error creating reservation:', err);
                this.isLoading = false;
                alert('Có lỗi xảy ra khi tạo đơn đặt phòng: ' + (err.message || 'Không xác định'));
            }
        );
    }
    
    processPayment(reservationId: string, paymentMethod: string) {
        const totalAmount = this.calculateTotal();
        
        if (paymentMethod === 'momo') {
            this.processMomoPayment(reservationId, totalAmount);
        } else if (paymentMethod === 'vnpay') {
            this.processVnPayPayment(reservationId, totalAmount);
        }
    }
    
    processMomoPayment(reservationId: string, amount: number) {
        const momoData = {
            amount: amount.toString(),
            orderInfo: `Thanh toán đặt phòng #${reservationId.substring(0, 8)}`
        };
        
        this.http.post<any>(environment.BASE_URL_API + '/user/payment/momoQR', momoData)
            .subscribe(
                (res) => {
                    // Lưu thông tin thanh toán
                    this.savePaymentInfo(reservationId, 'MOMO', amount);
                    
                    // Mở URL thanh toán MoMo trong cửa sổ mới
                    window.open(res.payUrl, '_blank');
                    
                    // Đóng modal
                    document.getElementById('reservation-modal-close')?.click();
                    
                    // Tải lại danh sách đặt phòng
                    this.GetReservationAll();
                    this.isLoading = false;
                },
                (err) => {
                    console.error('Error processing MoMo payment:', err);
                    this.isLoading = false;
                    alert('Có lỗi xảy ra khi xử lý thanh toán MoMo: ' + (err.message || 'Không xác định'));
                }
            );
    }
    
    processVnPayPayment(reservationId: string, amount: number) {
        const vnpayData = {
            amount: amount,
            orderDescription: `Thanh toán đặt phòng #${reservationId.substring(0, 8)}`,
            name: this.reservationForm.get('name')?.value || 'Khách hàng'
        };
        
        this.http.post<any>(environment.BASE_URL_API + '/user/vn-pay/create', vnpayData)
            .subscribe(
                (res) => {
                    // Lưu thông tin thanh toán
                    this.savePaymentInfo(reservationId, 'VNPAY', amount);
                    
                    // Mở URL thanh toán VNPay trong cửa sổ mới
                    window.open(res.url, '_blank');
                    
                    // Đóng modal
                    document.getElementById('reservation-modal-close')?.click();
                    
                    // Tải lại danh sách đặt phòng
                    this.GetReservationAll();
                    this.isLoading = false;
                },
                (err) => {
                    console.error('Error processing VNPay payment:', err);
                    this.isLoading = false;
                    alert('Có lỗi xảy ra khi xử lý thanh toán VNPay: ' + (err.message || 'Không xác định'));
                }
            );
    }
    
    savePaymentInfo(reservationId: string, payType: string, amount: number) {
        const paymentInfo = {
            priceTotal: amount,
            orderInfo: `Thanh toán đặt phòng #${reservationId.substring(0, 8)}`,
            orderType: payType,
            payType: payType,
            status: 0, // Trạng thái ban đầu là chưa thanh toán
            message: 'Đang chờ thanh toán',
            reservationId: reservationId
        };
        
        this.payment.invoiceCreate(paymentInfo).subscribe(
            (res) => {
                console.log('Payment info saved successfully', res);
            },
            (err) => {
                console.error('Error saving payment info:', err);
            }
        );
    }

    processCashPayment(reservationId: string) {
        const totalAmount = this.calculateTotal();
        
        // Lưu thông tin thanh toán với trạng thái là "Chưa thanh toán" (status = 0)
        const paymentInfo = {
            priceTotal: totalAmount,
            orderInfo: `Thanh toán đặt phòng #${reservationId.substring(0, 8)}`,
            orderType: 'CASH',
            payType: 'CASH',
            status: 0, // Trạng thái 0 = Chưa thanh toán
            message: 'Chưa thanh toán - Thanh toán tiền mặt tại quầy',
            reservationId: reservationId
        };
        
        this.payment.invoiceCreate(paymentInfo).subscribe(
            (res) => {
                console.log('Cash payment info saved', res);
                
                // Đóng modal
                document.getElementById('reservation-modal-close')?.click();
                
                // Reset form
                this.selectedRoom = null;
                this.searchedRooms = [];
                this.hasSearched = false;
                this.searchRoomForm.reset({
                    checkIn: formatDate(new Date(), 'yyyy-MM-dd', 'en-US'),
                    checkOut: formatDate(new Date(new Date().getTime() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd', 'en-US'),
                    roomTypeId: '',
                    peopleNumber: ''
                });
                
                // Tải lại danh sách đặt phòng
                this.GetReservationAll();
                this.isLoading = false;
                
                // Hiển thị thông báo thành công
                alert('Tạo đơn đặt phòng thành công! Trạng thái: Chưa thanh toán');
            },
            (err) => {
                console.error('Error saving cash payment info:', err);
                this.isLoading = false;
                alert('Có lỗi xảy ra khi lưu thông tin thanh toán: ' + (err.message || 'Không xác định'));
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
                    document.getElementById('detail-modal-close')?.click();
                },
                err => {
                    console.log(err);
                    this.isLoading = false;
                    alert('Đã xảy ra lỗi khi cập nhật trạng thái');
                }
            );
    }

    printReservation(id: string) {
        window.open(environment.BASE_URL_API + `/v2/reservation/print?id=${id}`, '_blank');
    }

    getTotalRevenue(): number {
        return this.reservationFilter
            .filter(item => item.status === true)
            .reduce((total, item) => total + item.reservationPrice, 0);
    }

    resetForms() {
        // Reset tất cả biểu mẫu
        const today = new Date();
        this.searchRoomForm.reset({
            checkIn: formatDate(today, 'yyyy-MM-dd', 'en-US'),
            checkOut: formatDate(new Date(today.getTime() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd', 'en-US'),
            roomTypeId: '',
            peopleNumber: ''
        });
        
        this.reservationForm.reset({
            name: '',
            email: '',
            phoneNumber: '',
            address: '',
            paymentMethod: 'cash',
            numberOfPeople: 1,
            roomId: ''
        });
        
        // Reset các trạng thái
        this.selectedRoom = null;
        this.searchedRooms = [];
        this.hasSearched = false;
        this.isSearching = false;
        this.numberOfDays = 1;
    }
}

export class ReservationModel {
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

export class ReservationPaymentModel {
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
