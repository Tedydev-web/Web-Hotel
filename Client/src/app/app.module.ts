import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { RouterModule } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthTokenInterceptor } from './_helper/http.interceptor';
import { HeaderComponent } from './header/header.component';
import { JwtModule, JWT_OPTIONS } from '@auth0/angular-jwt';
import { AuthGuard } from './_helper/http.guard';
import { RoomDetailComponent } from './room-detail/room-detail.component';
import { FooterComponent } from './footer/footer.component';
import { StorageService } from './_service/storage.service';
// import { NgToastModule } from 'ng-angular-popup';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { ProfileComponent } from './client/profile/profile.component';
import { SpinnerComponent } from './spinner/spinner.component';
import { LoadingInterceptor } from './loading.interceptor';
import { ForgetpasswordComponent } from './forgetpassword/forgetpassword.component';
import { ResetpasswordComponent } from './resetpassword/resetpassword.component';
import { ContactComponent } from './contact/contact.component';
import { ListingComponent } from './listing/listing.component';
import { EditProfileComponent } from './client/edit-profile/edit-profile.component';
import { PasswordChangeComponent } from './client/password-change/password-change.component';
import { AlertModule } from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';
import { BlogsComponent } from './blogs/blogs.component';
import { BlogDetailComponent } from './blog-detail/blog-detail.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { AboutComponent } from './about/about.component';
import { LeftContentComponent } from './client/dashboard/left-content/left-content.component';
import { SearchResultComponent } from './search-result/search-result.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import {MatSelectModule} from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatOption } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import {  ToastrModule } from 'ngx-toastr';
import { SuccessPaymentComponent } from './success-payment/success-payment.component';
import { PaymentdetailComponent } from './paymentdetail/paymentdetail.component';
import { VndCurrencyPipe } from './_shared/currency/vnd-currency.pipe';
import { BlogNewestComponent } from './blog-newest/blog-newest.component';
import { ModalComponent } from './pages/modal/modal/modal.component';
import { ConfirmRegisterComponent } from './confirm-register/confirm-register.component';
import { HotSaleComponent } from './hot-sale/hot-sale.component';
// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    // NgbModule,
    HttpClientModule,
    JwtModule.forRoot({
      jwtOptionsProvider: {
        provide: JWT_OPTIONS,
        deps: [StorageService],
        useFactory: jwtOptionsFactor
      }
    }),
    CommonModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      timeOut : 5000,
      progressBar: true,
      preventDuplicates: true,
      positionClass: 'toast-top-left'
    }),

    BrowserAnimationsModule,
    FormsModule,
    ToastrModule,
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
    NgxPaginationModule,
    BrowserModule,
    AppRoutingModule,
    RouterModule.forChild([{ path: 'products', component: ListingComponent },
    {
      path: 'products/:id',
      canActivate: [RoomDetailComponent],
      component: RoomDetailComponent
    }])
    ,
    FormsModule,
    ReactiveFormsModule,
    AlertModule,
    IconModule

  ],
  declarations: [
    VndCurrencyPipe,
    AppComponent,
    LoginComponent,
    SignupComponent,
    HomepageComponent,
    HeaderComponent,
    RoomDetailComponent,
    FooterComponent,
    PagenotfoundComponent,
    ProfileComponent,
    SpinnerComponent,
    ForgetpasswordComponent,
    ResetpasswordComponent,
    ContactComponent,
    ListingComponent,
    EditProfileComponent,
    PasswordChangeComponent,
    BlogsComponent,
    BlogDetailComponent,
    CheckoutComponent,
    AboutComponent,
    LeftContentComponent,
    SearchResultComponent,
    SuccessPaymentComponent,
    PaymentdetailComponent,
    VndCurrencyPipe,
    BlogNewestComponent,
    ModalComponent,
    ConfirmRegisterComponent,
    HotSaleComponent,
  ],

  providers:
    [
      {
        provide: CheckoutComponent,
        useValue: {}
      },
      {
        provide: HTTP_INTERCEPTORS,
        useClass: AuthTokenInterceptor,
        multi: true
      },
      [AuthGuard],
      [
        {
          provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true
        }
      ]
    ],
  bootstrap: [AppComponent],
})

export class AppModule { }

export function jwtOptionsFactor(storage: StorageService) {
  return {
    tokenGetter: () => {
      return storage.getAccessToken();
    }
  }
}
