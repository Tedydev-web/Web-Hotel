import { Component, OnInit, AfterViewInit } from "@angular/core";
import { ApiService } from "../../_service/api.service";
import { Staff } from "../../models/staff.model";
import { Observable, catchError, finalize, of } from "rxjs";
import { ReservationModel } from "../booking/booking.component";
import { Revenue, RevenueComponent } from "../../models/revenue.model";
import { DashboardApi } from "../../_service/dashboard.service";

declare var $: any;

@Component({
    selector: "app-layoutpage",
    templateUrl: "./layoutpage.component.html",
    styleUrls: ["./layoutpage.component.css"],
})
export class LayoutpageComponent implements OnInit, AfterViewInit {
    getSumResponse: any;
    getRoomTopBookedResponse: any;
    getUserTopBookedResponse: any;
    getEmployeeTopBookedResponse: any;
    getServiceRoomTopBookedResponse: any;
    revenueByServiceRoomResponse: any;
    loading: boolean = false;

    constructor(private api: ApiService, private dashboard: DashboardApi) {}
    ngOnInit(): void {
        this.loading = true;
        const currentYear = new Date().getFullYear();
        
        // Tránh tải JS trực tiếp 
        // $.getScript("assets/js/pages/demo.dashboard.js");
        
        this.getSum(currentYear);
        this.getRoomTopBooked(currentYear);
        this.getUserTopBooked(currentYear);
        this.revenueByServiceRoom(currentYear);
        this.getEmployeeTopBooked(currentYear);
        this.getServiceRoomTopBooked(currentYear);
    }
    ngAfterViewInit(): void {
        // Khởi tạo daterangepicker sau khi view đã được tạo
        setTimeout(() => {
            try {
                $("#dash-daterange").daterangepicker({
                    singleDatePicker: true,
                    showDropdowns: true,
                    locale: {
                        format: 'DD/MM/YYYY'
                    }
                });
            } catch (error) {
                console.error('Lỗi khi khởi tạo daterangepicker:', error);
            }
        }, 500);
    }
    reload(){
        window.location.reload()
    }
    getSum(year: any) {
        this.dashboard.getSum(year).pipe(
            catchError(error => {
                console.error('Error fetching sum data:', error);
                return of(null);
            }),
            finalize(() => this.loading = false)
        ).subscribe(
            (res) => {
                this.getSumResponse = res;
            }
        );
    }

    getRoomTopBooked(year: any) {
        this.dashboard.getRoomTopBooked(year).pipe(
            catchError(error => {
                console.error('Error fetching room top booked:', error);
                return of(null);
            })
        ).subscribe(
            (res) => {
                this.getRoomTopBookedResponse = res;
            }
        );
    }

    revenueByServiceRoom(year: any) {
        this.dashboard.revenueByServiceRoom(year).pipe(
            catchError(error => {
                console.error('Error fetching revenue by service room:', error);
                return of(null);
            })
        ).subscribe(
            (res) => {
                this.revenueByServiceRoomResponse = res;
            }
        );
    }

    getUserTopBooked(year: any) {
        this.dashboard.getUserTopBooked(year).pipe(
            catchError(error => {
                console.error('Error fetching user top booked:', error);
                return of(null);
            })
        ).subscribe(
            (res) => {
                this.getUserTopBookedResponse = res;
            }
        );
    }

    getEmployeeTopBooked(year: any) {
        this.dashboard.getEmployeeTopBooked(year).pipe(
            catchError(error => {
                console.error('Error fetching employee top booked:', error);
                return of(null);
            })
        ).subscribe(
            (res) => {
                this.getEmployeeTopBookedResponse = res;
            }
        );
    }

    getServiceRoomTopBooked(year: any) {
        this.dashboard.getServiceRoomTopBooked(year).pipe(
            catchError(error => {
                console.error('Error fetching service room top booked:', error);
                return of(null);
            })
        ).subscribe(
            (res) => {
                this.getServiceRoomTopBookedResponse = res;
            }
        );
    }

    sideBarOpen = true;

    sideBarToggler() {
        this.sideBarOpen = !this.sideBarOpen;
    }
}
