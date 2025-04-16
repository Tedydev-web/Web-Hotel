import { Component, OnInit, VERSION } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent  implements OnInit{
  ngOnInit(): void {
    $.getScript('../src/assets/js//vendor/apexcharts.min.js');

  }
  title = 'admin-hotel';

  sideBarOpen = true;
  isLoggedIn: boolean = false;
  sideBarToggler() {
    this.sideBarOpen = !this.sideBarOpen;
  }
  // version = VERSION.full;
  dateNow: Date = new Date();
}
