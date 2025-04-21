import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { Room, addRoom, roomType } from "../models/room.model";
import { AuthService } from "./auth.service";
import { Blog } from "../models/blog.model";
import { User } from "./user.model";
import { Data } from "@angular/router";
import { Search } from "src/app/models/search.model";
import { Staff } from "../models/staff.model";
import {
    OrderService,
    OrderServiceAdmin,
    ServiceAttach,
} from "../models/serviceAttach.model";
import { Discount } from "../models/discount.model";
import {
    RoomTypeService,
    ServiceAttachDetail,
} from "../models/roomtypeservice.model";
import { ReservationModel } from "../pages/booking/booking.component";
import { Revenue, RevenueYear } from "../models/revenue.model";
import { Salary } from "../models/salary";
import { environment } from "../environments/environment.development";

@Injectable({
    providedIn: "root",
})
export class ApiService {
    constructor(private http: HttpClient, private auth: AuthService) {}
    user: any;
    room!: addRoom;
    blog: any;
    private roomData: { [roomNumber: string]: any } = {};
    apiRoom = environment.BASE_URL_API + "/user/room/get-all";

    /////////////////////////////////////////////////////////////////////////////////////// Room API
    getRooms() {
        return this.http.get<Room[]>(
            environment.BASE_URL_API + "/v2/admin/room/get-all"
        );
    }

    postRoom(room: addRoom) {
        return this.http.post<any>(
            environment.BASE_URL_API + "/v2/admin/room/create",
            room
        );
    }
    deleteRoom(id: string): Observable<any> {
        return this.http.get(
            environment.BASE_URL_API + `/v2/admin/room/delete/?id=${id}`
        );
        // return this.http.delete(`http://localhost:3000/rooms/${id}`);
    }

    updateRoom(id: string): Observable<any> {
        return this.http.get(
            environment.BASE_URL_API + `/v2/admin/room/update/?id=${id}`
        );
    }

    getRoomDetail(id: string): Observable<Room> {
        const url =
            environment.BASE_URL_API + `/v2/admin/room/get-by-id?id=${id}`;
        // const url = `http://localhost:3000/rooms/${id}`;
        return this.http.get<Room>(url);
    }

    searchRoom(query: string): Observable<any> {
        return this.http.get<Room[]>(
            `${environment.BASE_URL_API}/api/Room/getAllBy${query}`
        );
    }

    DataAddToSearch(): Observable<any> {
        return this.http.get<any>(
            environment.BASE_URL_API + "/user/search-room"
        );
    }

    getRoomTypeId(): Observable<Search[]> {
        return this.http.get<Search[]>(
            environment.BASE_URL_API + "/user/search-room"
        );
    }

    updateRoomData(roomNumber: string, data: any): void {
        if (!this.roomData[roomNumber]) {
            this.roomData[roomNumber] = {};
        }
        this.roomData[roomNumber] = { ...this.roomData[roomNumber], ...data };
    }

    bookRoom(
        startDate: Data,
        enDate: Data,
        roomId: string,
        numberOfDays: number
    ): Observable<any> {
        const data = {
            start_date: startDate,
            end_date: enDate,
            room_id: roomId,
            number_of_days: numberOfDays,
        };
        return this.http.post(environment.BASE_URL_API + "", data);
    }

    /////////////////////////////////////////////////////////////////////////////////////// Room Type
    getAllRoomType(): Observable<roomType[]> {
        return this.http.get<roomType[]>(
            environment.BASE_URL_API + "/v2/admin/room-type/get-all"
        );
    }
    createRoomType(typeName: string) {
        return this.http.post(
            environment.BASE_URL_API + "/v2/admin/room-type/create",
            typeName
        );
    }
    updateRoomTypeName(roomTypeId: string, data: string): Observable<any> {
        return this.http.post(
            environment.BASE_URL_API +
                `/v2/admin/room-type/update?id=${roomTypeId}`,
            data
        );
    }
    deleteRoomType(id: number): Observable<any> {
        return this.http.get(
            environment.BASE_URL_API + `/v2/admin/room-type/delete?id=${id}`
        );
    }
    getRoomBySearch(dataSearch: any): Observable<Room> {
        const url = `${environment.BASE_URL_API}/user/room/get-by-all`;
        return this.http.post<Room>(url, dataSearch);
    }

    /////////////////////////////////////////////////////////////////////////////////////// Type service

    getAllService(): Observable<ServiceAttach[]> {
        return this.http.get<ServiceAttach[]>(
            environment.BASE_URL_API + "/v2/admin/service-attach/get-all"
        );
    }
    getServiceById(id: number): Observable<ServiceAttach> {
        return this.http.get<ServiceAttach>(
            environment.BASE_URL_API + `/v2/admin/service-attach/get-by-id?id=${id}`
        );
    }
    createService(typeName: string) {
        return this.http.post(
            environment.BASE_URL_API + "/v2/admin/service-attach/create",
            typeName
        );
    }
    updateService(data: string, id: number): Observable<any> {
        return this.http.post(
            environment.BASE_URL_API +
                `/v2/admin/service-attach/update?id=${id}`,
            data
        );
    }
    deleteService(id: number): Observable<any> {
        return this.http.get(
            environment.BASE_URL_API +
                `/v2/admin/service-attach/delete?id=${id}`
        );
    }

    /////////////////////////////////////////////////////////////////////////////////////// Blog API

    /////////////////////////////////////////////////////////////////////////////////////// Booking API

    getAllReservation(): Observable<ReservationModel[]> {
        return this.http.get<ReservationModel[]>(
            environment.BASE_URL_API + "/v2/admin/reservation/get-all"
        );
    }

    /////////////////////////////////////////////////////////////////////////////////////// User API

    getUser() {
        this.user = this.auth.userProfile;
        return this.user;
    }

    getallUser(): Observable<Staff[]> {
        return this.http.get<Staff[]>(
            environment.BASE_URL_API + "/v2/admin/account/get-user"
        );
    }
    getallEmployee(): Observable<Staff[]> {
        return this.http.get<Staff[]>(
            environment.BASE_URL_API + "/v2/admin/account/get-employee"
        );
    }

    /////////////////////////////////////////////////////////////////////////////////////// Discount API

    getAllDiscount(): Observable<Discount[]> {
        return this.http.get<Discount[]>(
            environment.BASE_URL_API + "/v2/admin/discount/get-all"
        );
    }
    createDiscount(typeName: string) {
        return this.http.post(
            environment.BASE_URL_API + "/v2/admin/discount/create",
            typeName
        );
    }
    updateDiscount(data: string, id: number): Observable<any> {
        return this.http.post(
            environment.BASE_URL_API + `/v2/admin/discount/update?id=${id}`,
            data
        );
    }
    deleteDiscount(id: number): Observable<any> {
        return this.http.get(
            environment.BASE_URL_API + `/v2/admin/discount/delete?id=${id}`
        );
    }
    getDiscountId(id: number): Observable<Discount> {
        return this.http.get<Discount>(
            environment.BASE_URL_API + `/v2/admin/discount/get-by-id?id=${id}`
        );
    }
    getAllDiscountType(): Observable<Discount[]> {
        return this.http.get<Discount[]>(
            environment.BASE_URL_API + "/v2/admin/discount-type/get-all"
        );
    }
    createDiscountForRoom(roomId: string, discountId: number): Observable<any> {
        const data = {
            roomId: roomId,
            discountId: discountId,
        };
        return this.http.post<any>(
            environment.BASE_URL_API + "/v2/admin/discount-room-detail/create",
            data
        );
    }

    /////////////////////////////////////////////////////////////////////////////////////// Room Type Service API

    getAllRoomTypeService(): Observable<RoomTypeService[]> {
        return this.http.get<RoomTypeService[]>(
            environment.BASE_URL_API + "/v2/admin/service-room/get-all"
        );
    }
    createRoomTypeService(data: RoomTypeService) {
        return this.http.post(
            environment.BASE_URL_API + "/v2/admin/service-room/create",
            data
        );
    }

    deleteRoomTypeService(id: number) {
        return this.http.get(
            environment.BASE_URL_API + `/v2/admin/service-room/delete?id=${id}`
        );
    }

    updateRoomTypeService(data: RoomTypeService, id: number): Observable<any> {
        return this.http.post(
            environment.BASE_URL_API + `/v2/admin/service-room/update?id=${id}`,
            data
        );
    }

    /////////////////////////////////////////////////////////////////////////////////////// ServiceAttachDetailAdmin API

    getAllServiceDetail(): Observable<ServiceAttachDetail[]> {
        return this.http.get<ServiceAttachDetail[]>(
            environment.BASE_URL_API + "/v2/admin/service-attach-detail/get-all"
        );
    }
    deleteServiceDetail(id: number): Observable<any> {
        return this.http.get(
            environment.BASE_URL_API +
                `/v2/admin/service-attach-detail/delete?id=${id}`
        );
    }
    createAttachService(
        roomTypeId: number,
        serviceAttachId2: number
    ): Observable<any> {
        const data = {
            roomTypeId: roomTypeId,
            serviceAttachId: serviceAttachId2,
        };
        return this.http.post(
            environment.BASE_URL_API + "/v2/admin/service-attach-detail/create",
            data
        );
    }
    deleteAttachServiceDetail(id: string) {
        return this.http.get(
            environment.BASE_URL_API +
                `/v2/admin/service-attach-detail/delete?id=${id}`
        );
    }

    /////////////////////////////////////////////////////////////////////////////////////// OrderService API

    createOrderService(data: OrderService) {
        return this.http.post<any>(
            environment.BASE_URL_API + "/v2/admin/order-service/create",
            data
        );
    }
    getAllOrderService(): Observable<OrderServiceAdmin[]> {
        return this.http.get<OrderServiceAdmin[]>(
            environment.BASE_URL_API + "/v2/admin/order-service/create"
        );
    }

    /////////////////////////////////////////////////////////////////////////////////////// Reservation API

    getReservationID(id: string): Observable<ReservationModel[]> {
        return this.http.get<ReservationModel[]>(
            environment.BASE_URL_API +
                `/v2/admin/reservation/get-by-id?id=${id}`
        );
    }

    /////////////////////////////////////////////////////////////////////////////////////// Revenue API

    getRevenue(): Observable<any[]> {
        return this.http.get<any[]>(
            environment.BASE_URL_API + "/v2/admin/revenue/get-sum"
        );
    }
    getRevenueByYear(year: number): Observable<any[]> {
        return this.http.get<any[]>(
            environment.BASE_URL_API +
                `/v2/admin/revenue/revenue-by-year?year=${year}`
        );
    }
    getRevenueByMonth(month: number, year: number): Observable<any[]> {
        return this.http.get<any[]>(
            environment.BASE_URL_API +
                `/v2/admin/revenue/revenue-by-month?month=${month}&year=${year}`
        );
    }
    getRevenueForRoom(year: number): Observable<any[]> {
        return this.http.get<any[]>(
            environment.BASE_URL_API +
                `/v2/admin/revenue/get-for-type-room?year=${year}`
        );
    }
}
