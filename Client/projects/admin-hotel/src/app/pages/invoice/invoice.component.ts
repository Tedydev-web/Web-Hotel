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
@Component({
    selector: "app-invoice",
    templateUrl: "./invoice.component.html",
    styleUrls: ["./invoice.component.css"],
})
export class InvoiceComponent {
    @ViewChild("invoice-table", { static: false }) yourTable!: ElementRef;
    reservationGetAll!: ReservationModel[];
    reservationFilter!: ReservationModel[];
    searchBooking: string = "";
    reservationGetById!: ReservationModel;
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
        if (this.searchBooking !== "") {
            this.GetAllInvoice();
        }
    }
    GetReservationAll() {}
    GetAllInvoice() {
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
                            },
                            (err) => {
                                console.log(err);
                            }
                        );
                },
                (err) => {
                    console.log(err);
                }
            );
    }
    GetReservationById(id: string) {
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
                                console.log(this.reservationGetById);
                            },
                            (err) => {
                                console.log(err);
                            }
                        );
                },
                (err) => {
                    console.log(err);
                }
            );
    }
    openPDF(): void {
        let DATA: any = document.getElementById("htmlData");
        html2canvas(DATA).then((canvas) => {
            let fileWidth = 190;
            let fileHeight = (canvas.height * fileWidth) / canvas.width;
            const FILEURI = canvas.toDataURL("image/png");
            let PDF = new jsPDF("p", "mm", "a4");
            let position = 0;
            PDF.addImage(FILEURI, "PNG", 0, position, fileWidth, fileHeight);
            PDF.save("angular-demo.pdf");
        });
    }

    searchBookings() {
        // Chuyển đổi từ khóa tìm kiếm thành chữ thường
        const searchTerm = this.searchBooking.toLowerCase();
        // Lọc các đặt phòng dựa trên từ khóa tìm kiếm
        this.reservationGetAll = this.reservationGetAll.filter(
            (item) =>
                item.roomNumber.toLowerCase().includes(searchTerm) ||
                item.name.toLowerCase().includes(searchTerm) ||
                item.invoice.id.toLowerCase().includes(searchTerm)
        );
        this.searchBooking = "";
    }
    clearSearch() {
        this.searchBooking = ""; // Xóa từ khóa tìm kiếm
        this.reservationGetAll = this.reservationFilter;
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
