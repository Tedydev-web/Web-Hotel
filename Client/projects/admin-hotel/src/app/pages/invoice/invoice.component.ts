import {
    Component,
    ElementRef,
    OnInit,
    PipeTransform,
    ViewChild,
} from "@angular/core";
import { DateFilterFn } from "@angular/material/datepicker";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment.development";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ApiService } from "src/app/_service/api.service";
import { DatePipe } from "@angular/common";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from 'xlsx';

@Component({
    selector: "app-invoice",
    templateUrl: "./invoice.component.html",
    styleUrls: ["./invoice.component.css"],
})
export class InvoiceComponent implements OnInit {
    @ViewChild("invoice-table", { static: false }) yourTable!: ElementRef;
    
    // Data models
    reservationGetAll: ReservationModel[] = [];
    reservationFilter: ReservationModel[] = [];
    filteredInvoices: ReservationModel[] = [];
    reservationGetById!: ReservationModel;
    
    // Search and filters
    searchBooking: string = "";
    statusFilter: string = 'all';
    dateFrom: string = '';
    dateTo: string = '';
    showFilters: boolean = false;
    
    // View settings
    viewMode: 'card' | 'table' = 'card';
    
    // Pagination
    pageSize: number = 10;
    currentPage: number = 1;
    totalPages: number = 1;
    
    // Loading state
    isLoading: boolean = false;
    
    // Form & other data
    bookingForm!: FormGroup;
    datePayment!: Date;
    invoiceAll: any;
    
    constructor(
        private http: HttpClient,
        private fb: FormBuilder,
        private datePipe: DatePipe
    ) {
        this.bookingForm = this.fb.group({
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString(),
            roomId: [""],
            numberOfDay: [""],
            email: [""],
            name: [""],
            phoneNumber: [""],
            address: [""],
            paymentMethod: ["momo"],
        });
    }
    
    ngOnInit(): void {
        this.GetAllInvoice();
    }
    
    GetAllInvoice() {
        this.isLoading = true;
        this.http
            .get(environment.BASE_URL_API + "/v2/admin/invoice/get-all")
            .subscribe(
                (res: any) => {
                    this.invoiceAll = res;
                    this.http
                        .get<ReservationModel[]>(
                            environment.BASE_URL_API +
                                "/v2/admin/reservation/get-all"
                        )
                        .subscribe(
                            (res1: any) => {
                                this.reservationGetAll = res1;
                                this.reservationFilter = res1;
                                this.reservationGetAll.forEach((item) => {
                                    this.invoiceAll.forEach((_invoice: any) => {
                                        if (_invoice.reservationId == item.id) {
                                            item.invoice = _invoice;
                                        }
                                    });
                                });
                                
                                // Filter to only show reservations with invoices
                                this.filteredInvoices = this.reservationGetAll.filter(item => item.invoice);
                                this.totalPages = Math.ceil(this.filteredInvoices.length / this.pageSize);
                                this.applyPagination();
                                this.isLoading = false;
                            },
                            (err) => {
                                console.log(err);
                                this.isLoading = false;
                            }
                        );
                },
                (err) => {
                    console.log(err);
                    this.isLoading = false;
                }
            );
    }
    
    GetReservationById(id: string) {
        this.isLoading = true;
        this.http
            .get<ReservationModel>(
                environment.BASE_URL_API +
                    `/v2/admin/reservation/get-by-id?id=${id}`
            )
            .subscribe(
                (res) => {
                    this.reservationGetById = res;
                    this.invoiceAll.forEach((_invoice: any) => {
                        if (
                            _invoice.reservationId == this.reservationGetById.id
                        ) {
                            this.reservationGetById.invoice = _invoice;
                        }
                    });
                    this.http
                        .get(
                            environment.BASE_URL_API +
                                `/v2/admin/order-service/get-by-reservation?reservationId=${this.reservationGetById.id}`
                        )
                        .subscribe(
                            (res1: any) => {
                                this.reservationGetById.service = res1;
                                this.isLoading = false;
                            },
                            (err) => {
                                console.log(err);
                                this.isLoading = false;
                            }
                        );
                },
                (err) => {
                    console.log(err);
                    this.isLoading = false;
                }
            );
    }
    
    // PDF generation
    openPDF(): void {
        let DATA: any = document.getElementById("htmlData");
        html2canvas(DATA).then((canvas) => {
            let fileWidth = 190;
            let fileHeight = (canvas.height * fileWidth) / canvas.width;
            const FILEURI = canvas.toDataURL("image/png");
            let PDF = new jsPDF("p", "mm", "a4");
            let position = 0;
            PDF.addImage(FILEURI, "PNG", 0, position, fileWidth, fileHeight);
            PDF.save(`invoice-${this.reservationGetById.invoice?.id}.pdf`);
        });
    }
    
    // Print invoice
    printInvoice(id: string) {
        // Navigate to print endpoint
        window.open(environment.BASE_URL_API + `/v2/admin/invoice/print?id=${id}`, '_blank');
    }
    
    // Download PDF directly
    downloadPDF(id: string) {
        this.GetReservationById(id);
        setTimeout(() => {
            this.openPDF();
        }, 1000);
    }
    
    // Search functions
    searchBookings() {
        if (!this.searchBooking.trim()) {
            this.filteredInvoices = this.reservationFilter.filter(item => item.invoice);
            return;
        }
        
        // Convert search term to lowercase
        const searchTerm = this.searchBooking.toLowerCase();
        
        // Filter reservations based on search term
        this.filteredInvoices = this.reservationFilter.filter(
            (item) => 
                (item.invoice && item.roomNumber.toLowerCase().includes(searchTerm)) ||
                (item.invoice && item.name.toLowerCase().includes(searchTerm)) ||
                (item.invoice && item.invoice.id.toLowerCase().includes(searchTerm))
        );
        
        this.totalPages = Math.ceil(this.filteredInvoices.length / this.pageSize);
        this.currentPage = 1;
        this.applyPagination();
    }
    
    clearSearch() {
        this.searchBooking = ""; // Clear search term
        this.filteredInvoices = this.reservationFilter.filter(item => item.invoice);
        this.totalPages = Math.ceil(this.filteredInvoices.length / this.pageSize);
        this.currentPage = 1;
        this.applyPagination();
    }
    
    // Filter functions
    toggleFilterSection() {
        this.showFilters = !this.showFilters;
    }
    
    clearFilters() {
        this.searchBooking = '';
        this.statusFilter = 'all';
        this.dateFrom = '';
        this.dateTo = '';
        this.filteredInvoices = this.reservationFilter.filter(item => item.invoice);
        this.totalPages = Math.ceil(this.filteredInvoices.length / this.pageSize);
        this.currentPage = 1;
        this.applyPagination();
    }
    
    applyFilters() {
        let filtered = [...this.reservationFilter].filter(item => item.invoice);
        
        // Filter by search term
        if (this.searchBooking.trim()) {
            const searchTerm = this.searchBooking.toLowerCase();
            filtered = filtered.filter((item) =>
                item.roomNumber.toLowerCase().includes(searchTerm) ||
                item.name.toLowerCase().includes(searchTerm) ||
                (item.invoice && item.invoice.id.toLowerCase().includes(searchTerm))
            );
        }
        
        // Filter by status
        if (this.statusFilter !== 'all') {
            const status = this.statusFilter === 'true';
            filtered = filtered.filter(item => item.status === status);
        }
        
        // Filter by date range (using invoice payment date)
        if (this.dateFrom) {
            const fromDate = new Date(this.dateFrom);
            filtered = filtered.filter(item => {
                if (!item.invoice || !item.invoice.payAt) return false;
                const payDate = new Date(item.invoice.payAt);
                return payDate >= fromDate;
            });
        }
        
        if (this.dateTo) {
            const toDate = new Date(this.dateTo);
            toDate.setHours(23, 59, 59);
            filtered = filtered.filter(item => {
                if (!item.invoice || !item.invoice.payAt) return false;
                const payDate = new Date(item.invoice.payAt);
                return payDate <= toDate;
            });
        }
        
        this.filteredInvoices = filtered;
        this.totalPages = Math.ceil(this.filteredInvoices.length / this.pageSize);
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
        const totalPages = Math.ceil(this.filteredInvoices.length / this.pageSize);
        
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
        const endIndex = startIndex + this.pageSize;
        this.filteredInvoices = this.filteredInvoices.slice(0, this.filteredInvoices.length);
    }
    
    // View mode
    setViewMode(mode: 'card' | 'table') {
        this.viewMode = mode;
    }
    
    // Sort function
    sortBy(criteria: string) {
        let sorted = [...this.filteredInvoices];
        
        switch (criteria) {
            case 'newest':
                sorted.sort((a, b) => {
                    if (!a.invoice?.payAt || !b.invoice?.payAt) return 0;
                    return new Date(b.invoice.payAt).getTime() - new Date(a.invoice.payAt).getTime();
                });
                break;
            case 'oldest':
                sorted.sort((a, b) => {
                    if (!a.invoice?.payAt || !b.invoice?.payAt) return 0;
                    return new Date(a.invoice.payAt).getTime() - new Date(b.invoice.payAt).getTime();
                });
                break;
            case 'priceHighest':
                sorted.sort((a, b) => {
                    if (!a.invoice?.priceReservedRoom || !b.invoice?.priceReservedRoom) return 0;
                    return b.invoice.priceReservedRoom - a.invoice.priceReservedRoom;
                });
                break;
            case 'priceLowest':
                sorted.sort((a, b) => {
                    if (!a.invoice?.priceReservedRoom || !b.invoice?.priceReservedRoom) return 0;
                    return a.invoice.priceReservedRoom - b.invoice.priceReservedRoom;
                });
                break;
        }
        
        this.filteredInvoices = sorted;
    }
    
    // Export to Excel
    exportToExcel() {
        const data = this.reservationFilter.filter(item => item.invoice).map(item => {
            return {
                'Mã hóa đơn': item.invoice?.id || '',
                'Phòng': item.roomNumber,
                'Khách hàng': item.name,
                'Ngày bắt đầu': new Date(item.startDate).toLocaleDateString('vi-VN'),
                'Ngày kết thúc': new Date(item.endDate).toLocaleDateString('vi-VN'),
                'Số ngày': item.numberOfDay,
                'Giá phòng': item.roomPrice,
                'Tổng tiền': item.invoice?.priceReservedRoom || 0,
                'Ngày thanh toán': item.invoice?.payAt ? new Date(item.invoice.payAt).toLocaleDateString('vi-VN') : '',
                'Trạng thái': item.status ? 'Đã thanh toán' : 'Chưa thanh toán'
            };
        });
        
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách hóa đơn');
        
        // Export Excel file
        XLSX.writeFile(workbook, 'danh-sach-hoa-don.xlsx');
    }
    
    // Calculate service totals for invoice
    getTotalServicePrice(reservation: ReservationModel): number {
        if (!reservation.service || !reservation.service.length) {
            return 0;
        }
        
        return reservation.service.reduce((total: number, service: any) => {
            return total + (service.price * service.quantity);
        }, 0);
    }
    
    calculateTotal(reservation: ReservationModel): number {
        if (!reservation.invoice) {
            return 0;
        }
        
        const roomTotal = reservation.invoice.priceReservedRoom || 0;
        const serviceTotal = this.getTotalServicePrice(reservation);
        
        return roomTotal + serviceTotal;
    }
    
    // Dashboard metrics
    getTotalRevenue(): number {
        return this.reservationFilter
            .filter(item => item.invoice && item.status === true)
            .reduce((total, item) => total + (item.invoice?.priceReservedRoom || 0), 0);
    }
}

export class ReservationModel {
    id!: string;
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
    email!: string;
    invoice: any;
    service: any;
}

export class ReservationPaymentModel {
    id!: string;
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
