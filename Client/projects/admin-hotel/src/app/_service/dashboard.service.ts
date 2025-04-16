import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../environments/environment.development";
import { Observable } from "rxjs";
import { StatusResponse } from "../models/statusResponse.model";

@Injectable({
    providedIn: "root",
})
export class DashboardApi {
    constructor(private http: HttpClient) {}

    getSum(year: any): Observable<any> {
        return this.http.get<any>(
            `${environment.BASE_URL_API}/v2/admin/revenue/get-sum?year=${year}`
        );
    }

    revenueByYear(year: any): Observable<any> {
        return this.http.get<any>(
            `${environment.BASE_URL_API}/v2/admin/revenue/revenue-by-year?year=${year}`
        );
    }

    revenueByMonth(month: any, year: any): Observable<any> {
        return this.http.get<any>(
            `${environment.BASE_URL_API}/v2/admin/revenue/revenue-by-year?month=${month}&year=${year}`
        );
    }

    revenueByTypeRoom(year: any): Observable<any> {
        return this.http.get<any>(
            `${environment.BASE_URL_API}/v2/admin/revenue/get-for-type-room?year=${year}`
        );
    }

    revenueByServiceRoom(year: any): Observable<any> {
        return this.http.get<any>(
            `${environment.BASE_URL_API}/v2/admin/revenue/get-room-and-service?year=${year}`
        );
    }

    getRoomTopBooked(year: any): Observable<any> {
        return this.http.get<any>(
            `${environment.BASE_URL_API}/v2/admin/revenue/get-room-top-booked?year=${year}`
        );
    }

    getUserTopBooked(year: any): Observable<any> {
        return this.http.get<any>(
            `${environment.BASE_URL_API}/v2/admin/revenue/get-user-top-booked?year=${year}`
        );
    }

    getEmployeeTopBooked(year: any): Observable<any> {
        return this.http.get<any>(
            `${environment.BASE_URL_API}/v2/admin/revenue/get-employee-top-booked?year=${year}`
        );
    }

    getServiceRoomTopBooked(year: any): Observable<any> {
        return this.http.get<any>(
            `${environment.BASE_URL_API}/v2/admin/revenue/get-service-room-top-booked?year=${year}`
        );
    }
}
