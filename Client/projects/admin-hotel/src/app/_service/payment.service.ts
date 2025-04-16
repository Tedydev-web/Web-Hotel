import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../environments/environment.development";
import { Observable } from "rxjs";
import { StatusResponse } from "../models/statusResponse.model";

@Injectable({
    providedIn: "root",
})
export class PaymentApi {
    constructor(private http: HttpClient) {}

    invoiceCreate(invoiceCreate: any): Observable<StatusResponse> {
        return this.http.post<StatusResponse>(
            environment.BASE_URL_API + "/v2/admin/invoice/create",
            invoiceCreate
        );
    }

    
}


