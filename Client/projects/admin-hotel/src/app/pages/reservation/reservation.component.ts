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

@Component({
    selector: "app-reservation",
    templateUrl: "./reservation.component.html",
    styleUrls: ["./reservation.component.css"],
})
export class ReservationComponent implements OnInit {
    formReservation!: FormGroup;
    formSearch!: FormGroup;
    reservationForm!: FormGroup;
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

    constructor(
        private reservation: ReservationApi,
        private payment: PaymentApi,
        private fb: FormBuilder,
        private roomService: ApiService,
        private router: Router,
        private room: RoomApi,
        private http: HttpClient
    ) {
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
        
        this.reservationForm = this.fb.group({
            roomId: ['', Validators.required],
            startDate: [new Date(), Validators.required],
            numberOfDay: [1, [Validators.required, Validators.min(1)]],
            numberOfPeople: [1, [Validators.required, Validators.min(1)]],
            endDate: [new Date(new Date().setDate(new Date().getDate() + 1)), Validators.required],
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
            address: ['', Validators.required],
            payType: ['VNPAY', Validators.required]
        });
    }

    ngOnInit(): void {
        this.checkSearchData = true;
        this.getRooms();
        this.getDataAddSearch();
        this.GetReservationAll();
        this.loadAvailableRooms();
        
        this.reservationForm.get('startDate')?.valueChanges.subscribe(() => {
            this.updateEndDate();
        });
        
        this.reservationForm.get('numberOfDay')?.valueChanges.subscribe(() => {
            this.updateEndDate();
        });
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
        this.http.get(environment.BASE_URL_API + '/v2/admin/room/available-rooms')
            .subscribe(
                (res: any) => {
                    this.availableRooms = res;
                },
                err => console.log(err)
            );
    }

    updateEndDate() {
        const startDate = this.reservationForm.get('startDate')?.value;
        const numberOfDays = this.reservationForm.get('numberOfDay')?.value;
        
        if (startDate && numberOfDays) {
            const start = new Date(startDate);
            const end = new Date(start);
            end.setDate(start.getDate() + parseInt(numberOfDays));
            
            this.reservationForm.get('endDate')?.setValue(end.toISOString().slice(0, 16));
        }
    }

    calculateTotal(): number {
        const roomId = this.reservationForm.get('roomId')?.value;
        const numberOfDays = this.reservationForm.get('numberOfDay')?.value || 0;
        
        if (!roomId || !numberOfDays) return 0;
        
        const selectedRoom = this.availableRooms.find(room => room.id === roomId);
        if (!selectedRoom) return 0;
        
        return selectedRoom.currentPrice * numberOfDays;
    }

    createReservation() {
        if (this.reservationForm.invalid) {
            Object.keys(this.reservationForm.controls).forEach(key => {
                const control = this.reservationForm.get(key);
                if (control) {
                    control.markAsTouched();
                }
            });
            return;
        }
        
        this.isLoading = true;
        this.http.post(environment.BASE_URL_API + '/v2/admin/reservation/create', this.reservationForm.value)
            .subscribe(
                (res: any) => {
                    this.isLoading = false;
                    alert('Đặt phòng thành công');
                    this.GetReservationAll();
                    this.reservationForm.reset();
                    this.reservationForm = this.fb.group({
                        startDate: [new Date().toISOString().slice(0, 16), Validators.required],
                        endDate: [{value: '', disabled: true}],
                        roomId: ['', Validators.required],
                        numberOfDay: [1, [Validators.required, Validators.min(1)]],
                        email: ['', [Validators.required, Validators.email]],
                        name: ['', Validators.required],
                        phoneNumber: ['', Validators.required],
                        address: ['', Validators.required],
                        payType: ['VNPAY', Validators.required],
                    });
                    document.getElementById('reservation-modal-close')?.click();
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
