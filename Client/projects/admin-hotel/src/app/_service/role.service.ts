import { Injectable, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment.development';
import { Roles } from '../models/roles.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class RoleService implements OnInit{

    constructor(private http: HttpClient ,private auth: AuthService) {}
    ngOnInit(): void {
       this.getAllRoles()
    }


    getAllRoles(): Observable<Roles[]>{
        return this.http.get<Roles[]>(environment.BASE_URL_API + '/v2/admin/role/get-all')
    }
    
    updateRole(role: Roles, id: number): Observable<Roles> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.put<Roles>(
            `${environment.BASE_URL_API}/v2/admin/roles/update/${id}`,
            role,
            httpOptions
        );
    }
    
    deleteRole(id: number): Observable<any> {
        return this.http.delete<any>(
            `${environment.BASE_URL_API}/v2/admin/roles/delete/${id}`
        );
    }
}
