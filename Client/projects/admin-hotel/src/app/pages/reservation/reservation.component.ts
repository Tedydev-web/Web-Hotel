import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { Room } from "../../models/room.model";
import { ApiService } from "../../_service/api.service";
import { PaymentApi } from "../../_service/payment.service";
import { ReservationApi } from "../../_service/reservation.service";
import { RoomApi } from "../../_service/room.service";

@Component({
    selector: "app-reservation",
    templateUrl: "./reservation.component.html",
    styleUrls: ["./reservation.component.css"],
})
export class ReservationComponent implements OnInit {
    formReservation!: FormGroup;
    formSearch!: FormGroup;
    rooms!: Room[];
    dataSearch: any = {
        maxPerson: "",
        maxPrice: "",
        roomTypes: "",
        serviceAttachs: "",
    };
    checkSearchData: any;
    constructor(
        private reservation: ReservationApi,
        private payment: PaymentApi,
        private fb: FormBuilder,
        private roomService: ApiService,
        private router: Router,
        private room: RoomApi
    ) {
        this.formReservation = this.fb.group({
            startDate: [],
            endDate: [],
            roomId: [""],
            numberOfDay: [0],
            numberOfPeople: [0],
            name: [""],
            email: [""],
            phoneNumber: [""],
            address: [""],
        });
        this.formSearch = this.fb.group({
            checkIn: new Date(),
            checkOut: new Date(new Date().setDate(new Date().getDate() + 1)),
            peopleNumber: 0,
            roomTypeId: 0,
        });
    }

    ngOnInit(): void {
        this.checkSearchData = true;
        this.getRooms();
        this.getDataAddSearch();
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
}
