import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../_service/api.service';
import { Staff } from '../../models/staff.model';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit {
    Accounts: Staff[] = [];
    roomTypeResult: Staff[] = [];
    numAccount!: number;
    numbBookings!: number;
    revenueTotal!: number;
    searchTerm2: string = '';

    constructor(private api: ApiService) { }
    ngOnInit(): void {

        this.api.getallEmployee().subscribe(res => {
            this.Accounts = res;
            this.roomTypeResult = this.Accounts
            console.log(this.Accounts)

        })
    }
    
    searchBookings2() {
        // Chuyển đổi từ khóa tìm kiếm thành chữ thường
        const searchTerm = this.searchTerm2.toLowerCase();
        // Lọc các đặt phòng dựa trên từ khóa tìm kiếm
        this.Accounts = this.Accounts.filter((item) =>
            item.email.includes(searchTerm) ||
            item.userName.toLowerCase().includes(searchTerm)

        );
        this.searchTerm2 = ''

    }
    clearSearch2() {
        this.Accounts = this.roomTypeResult
    }
}