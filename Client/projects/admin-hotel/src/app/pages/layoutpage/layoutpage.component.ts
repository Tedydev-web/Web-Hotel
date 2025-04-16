import { Component, OnInit } from "@angular/core";
import { ApiService } from "../../_service/api.service";
import { Staff } from "../../models/staff.model";
import { Observable } from "rxjs";
import { ReservationModel } from "../booking/booking.component";
import { Revenue, RevenueComponent } from "../../models/revenue.model";
import { DashboardApi } from "../../_service/dashboard.service";
@Component({
    selector: "app-layoutpage",
    templateUrl: "./layoutpage.component.html",
    styleUrls: ["./layoutpage.component.css"],
})
export class LayoutpageComponent implements OnInit {
    getSumResponse: any;
    getRoomTopBookedResponse: any;
    getUserTopBookedResponse: any;
    getEmployeeTopBookedResponse: any;
    getServiceRoomTopBookedResponse: any;
    revenueByServiceRoomResponse: any;

    constructor(private api: ApiService, private dashboard: DashboardApi) {}
    ngOnInit(): void {
        $.getScript("assets/js/pages/demo.dashboard.js");
        this.getSum(2023);
        this.getRoomTopBooked(2023);
        this.getUserTopBooked(2023);
        this.revenueByServiceRoom(2023);
        this.getEmployeeTopBooked(2023);
        this.getServiceRoomTopBooked(2023);
    }
    reload(){
        window.location.reload()
    }
    getSum(year: any) {
        this.dashboard.getSum(year).subscribe(
            (res) => {
                this.getSumResponse = res;
            },
            (err) => {}
        );
    }

    getRoomTopBooked(year: any) {
        this.dashboard.getRoomTopBooked(year).subscribe(
            (res) => {
                this.getRoomTopBookedResponse = res;
            },
            (err) => {}
        );
    }

    revenueByServiceRoom(year: any) {
        this.dashboard.revenueByServiceRoom(year).subscribe(
            (res) => {
                this.revenueByServiceRoomResponse = res;
                console.log(this.revenueByServiceRoomResponse);                
            },
            (err) => {}
        );
    }

    getUserTopBooked(year: any) {
        this.dashboard.getUserTopBooked(year).subscribe(
            (res) => {
                this.getUserTopBookedResponse = res;
            },
            (err) => {}
        );
    }

    getEmployeeTopBooked(year: any) {
        this.dashboard.getEmployeeTopBooked(year).subscribe(
            (res) => {
                this.getEmployeeTopBookedResponse = res;
            },
            (err) => {}
        );
    }

    getServiceRoomTopBooked(year: any) {
        this.dashboard.getServiceRoomTopBooked(year).subscribe(
            (res) => {
                this.getServiceRoomTopBookedResponse = res;
                console.log(this.getServiceRoomTopBooked)
            },
            (err) => {}
        );
    }

    sideBarOpen = true;

    sideBarToggler() {
        this.sideBarOpen = !this.sideBarOpen;
    }
}
