import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../environments/environment.development";
import { Observable } from "rxjs";
import { Room } from "../models/room.model";
import { StatusResponse } from "../models/statusResponse.model";

@Injectable({
    providedIn: "root",
})
export class RoomApi {
    constructor(private http: HttpClient) {}

    getRoomBySearch(dataSearch: any): Observable<Room[]> {
        const url = `${environment.BASE_URL_API}/user/room/get-all-by`;
        return this.http.post<Room[]>(url, dataSearch);
    }

    getRoomById(roomId: any): Observable<Room> {
        const url = `${environment.BASE_URL_API}/v2/admin/room/get-by-id?id=${roomId}`;
        return this.http.get<Room>(url);
    }
}
