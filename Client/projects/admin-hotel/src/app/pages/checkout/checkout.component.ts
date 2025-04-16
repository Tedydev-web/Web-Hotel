import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { Room } from "../../models/room.model";
import { PaymentApi } from "../../_service/payment.service";
import { ReservationApi, ReservationResponse } from "../../_service/reservation.service";
import { RoomApi } from "../../_service/room.service";

@Component({
    selector: "app-checkout",
    templateUrl: "./checkout.component.html",
    styleUrls: ["./checkout.component.css"],
})
export class CheckoutComponent implements OnInit {
    //init form
    checkoutForm!: FormGroup;
    //constructor
    constructor(
        private payment: PaymentApi,
        private toastr: ToastrService,
        private route: ActivatedRoute,
        private router: Router,
        private reservation: ReservationApi,
        private room: RoomApi,
        private fb: FormBuilder,
    ) {
        // form chỉ cần này là đủ
        this.checkoutForm = this.fb.group({
            reservationId: [""],
            name: [""],
            email: [""],
            phoneNumber: [""],
            address: [""],
            numberOfPeople: [""]
        });
    }
    //variable
    reservationId: any = this.route.snapshot.paramMap.get("reservationId");
    roomId: any = this.route.snapshot.paramMap.get("roomId");
    reservationResponse: ReservationResponse = new ReservationResponse();
    roomResponse: Room = new Room();
    //function
    ngOnInit(): void {
        this.checkoutForm.controls["reservationId"].setValue(this.reservationId);        
        this.getReservationById(this.reservationId);
        this.getRoomById(this.roomId);
    }

    //Hàm này call khi ấn nút checkout
    invoiceCreate() {
        this.payment.invoiceCreate(this.checkoutForm.value).subscribe(
            (res) => {
                this.toastr.success(res.message);
                this.router.navigate(['/reservation']);
            },
            (err) => {
                this.toastr.error(err.message);
            }
        );
    }

    //hàm này lấy reservation đã tạo tạm và phòng để đổ dữ liệu
    getReservationById(reservationId: any) {
        this.reservation.getReservationByID(reservationId).subscribe(
            (res) => {
                this.reservationResponse = res;              
            },
            (err) => {
                this.toastr.error(err.message);
            }
        );
    }

    getRoomById(roomId: any)
    {
        this.room.getRoomById(roomId).subscribe(
            res=>{
                this.roomResponse = res;
            },
            err=>{
                this.toastr.error(err.message);
            }
        )
    }
}
