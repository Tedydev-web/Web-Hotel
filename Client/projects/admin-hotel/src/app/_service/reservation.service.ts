import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../environments/environment.development";
import { Observable } from "rxjs";
import { Room } from "../models/room.model";
import { StatusResponse } from "../models/statusResponse.model";

@Injectable({
    providedIn: "root",
})
export class ReservationApi {
    constructor(private http: HttpClient) {}

    reservationCreate(
        reservationCreate: any
    ): Observable<ReservationCreateResponse> {
        return this.http.post<ReservationCreateResponse>(
            environment.BASE_URL_API + "/v2/admin/reservation/create",
            reservationCreate
        );
    } 

    getReservationByID(reservationId: any): Observable<ReservationResponse> {
        return this.http.get<ReservationResponse>(
            `${environment.BASE_URL_API}/v2/admin/reservation/get-by-id?id=${reservationId}`
        );
    }
}

export class ReservationCreateResponse {
    reservationId!: string;
    statusCode!: number;
    message!: string;
}

export class ReservationResponse {
    id!: string;  
    startDate!: Date;  
    numberOfDay!: number;  
    numberOfPeople!: number;
    endDate!: Date;  
    roomPrice!: number;  
    reservationPrice!: number;  
    name!: string;  
    email!: string;  
    phoneNumber!: string;  
    address!: string;  
    roomId!: string;
  }
