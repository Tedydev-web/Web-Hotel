import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-left-content',
  templateUrl: './left-content.component.html',
  styleUrls: ['./left-content.component.scss']
})
export class LeftContentComponent implements OnInit {

  constructor(private route: Router){}
  ngOnInit(): void {

  }
  logout(): void {
    // Xóa thông tin người dùng khỏi localStorage hoặc sessionStorage khi đăng xuất
    localStorage.removeItem('token');
  }
  routepage(){
    this.route.navigate(['/paymentdetail'])
  }
  storeLoad(){
   const LoadJs = localStorage.setItem('LoadJs', '1')
  }
}
