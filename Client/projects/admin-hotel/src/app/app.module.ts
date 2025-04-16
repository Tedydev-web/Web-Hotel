import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { LayoutpageComponent } from './pages/layoutpage/layoutpage.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { BookingComponent } from './pages/booking/booking.component';
import { LoginAdminComponent } from './pages/login-admin/login-admin.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgToastModule } from 'ng-angular-popup';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { JWT_OPTIONS, JwtModule } from '@auth0/angular-jwt';
import { StorageService } from './_service/storage.service';
import { AuthTokenInterceptor } from './_helper/http.interceptor';
import { PageErrorComponent } from './pages/page-error/page-error.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { BellNotifComponent } from './components/bell-notif/bell-notif.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { LoadingInterceptor } from './_helper/loading.interceptor';
import { AuthGuard } from './_helper/http.guard';
import { RoomComponent } from './pages/room/room.component';
import { CustomerComponent } from './pages/customer/customer.component';
import { EmployeeComponent } from './pages/employee/employee.component';
import { RoomtypeComponent } from './pages/roomtype/roomtype.component';
import { RoomservicesComponent } from './pages/roomservices/roomservices.component';
import { DiscountComponent } from './pages/discount/discount.component';
import { VndCurrencyPipe } from 'src/app/_shared/currency/vnd-currency.pipe';
import { BlogComponent } from './pages/blog/blog.component';
import { RoomTypeServiceComponent } from './pages/room-type-service/room-type-service.component';
import { FilterPipe } from './_shared/filter.pipe';
import { BookingFilterPipe } from './_shared/booking/booking-filter.pipe';
import { ChartModule } from 'angular-highcharts';
import { ChartComponent } from './components/chart/chart.component';
import { RoomBookedComponent } from './pages/room-booked/room-booked.component';
import { RevenueComponent } from './pages/revenue/revenue.component';
import { ReservationComponent } from './pages/reservation/reservation.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { InvoiceComponent } from './pages/invoice/invoice.component';
import { DatePipe, CommonModule } from '@angular/common';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { CheckoutDetailComponent } from './pages/checkout-detail/checkout-detail.component';
import { ApiService } from './_service/api.service';
import { PieChartComponent } from './components/chart/pie-chart/pie-chart.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { BarChartComponent } from './components/chart/bar-chart/bar-chart.component';
import { HighchartsChartModule } from 'highcharts-angular';
import { SalaryComponent } from './pages/salary/salary.component';
import { RoleComponent } from './pages/role/role.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { SignupComponent } from './pages/signup/signup.component';
import { environment } from 'src/environments/environment.development';
@NgModule({
  declarations: [
    ChartComponent,
    FilterPipe,
    BellNotifComponent,
    AppComponent,
    HeaderComponent,
    SidebarComponent,
    LayoutpageComponent,
    BookingComponent,
    CustomerComponent,
    RoomComponent,
    LoginAdminComponent,
    PageErrorComponent,
    EmployeeComponent,
    SpinnerComponent,
    RoomtypeComponent,
    RoomservicesComponent,
    DiscountComponent,
    VndCurrencyPipe,
    BlogComponent,
    RoomTypeServiceComponent,
    FilterPipe,
    BookingFilterPipe,
    RoomBookedComponent,
    RevenueComponent,
    ReservationComponent,
    InvoiceComponent,
    CheckoutComponent,
    CheckoutDetailComponent,
    PieChartComponent,
    BarChartComponent,
    SalaryComponent,
    RoleComponent,
    UserProfileComponent,
    SignupComponent,
  ],
  imports: [
    NgApexchartsModule,
    CommonModule ,
    ChartModule,
    FormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    FormsModule,
    NgToastModule,
    BrowserModule,
    AppRoutingModule,
    MatDialogModule,
    MatOptionModule,
    MatSelectModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatIconModule,
    MatNativeDateModule,
    MatDialogModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatSidenavModule,
    MatToolbarModule,
    MatMenuModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    HighchartsChartModule,
    JwtModule.forRoot({
      jwtOptionsProvider:{
        provide:JWT_OPTIONS,
        useFactory: jwtOptionsFactor,
        deps:[StorageService]
      }
    }),
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers:
  [
    { provide: HTTP_INTERCEPTORS,
      useClass: AuthTokenInterceptor,
      multi: true
    },
    [AuthGuard],
    [
      {
        provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true
      }
    ],
    [DatePipe],
    [ApiService]

  ],
  bootstrap: [AppComponent],
  
})
export class AppModule { }

export function jwtOptionsFactor(storage:StorageService){
  return {
      tokenGetter: () => {
          console.log("Đã add authen");

          return storage.getAccessToken();
      },
      allowedDomains: [environment.BASE_URL_API],
      disallowedRoutes: [
          environment.BASE_URL_API + "/user/login",
          environment.BASE_URL_API + "/user/token/refresh",
      ],
      skipWhenExpired: false,
  };
}

