import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutpageComponent } from './pages/layoutpage/layoutpage.component';
import { BookingComponent } from './pages/booking/booking.component';
import { LoginAdminComponent } from './pages/login-admin/login-admin.component';
import { AuthGuard } from './_helper/http.guard';
import { PageErrorComponent } from './pages/page-error/page-error.component';
import { CustomerComponent } from './pages/customer/customer.component';
import { RoomComponent } from './pages/room/room.component';
import { RoomtypeComponent } from './pages/roomtype/roomtype.component';
import { RoomservicesComponent } from './pages/roomservices/roomservices.component';
import { DiscountComponent } from './pages/discount/discount.component';
import { BlogComponent } from './pages/blog/blog.component';
import { RoomTypeServiceComponent } from './pages/room-type-service/room-type-service.component';
import { RevenueComponent } from './pages/revenue/revenue.component';
import { RoomBookedComponent } from './pages/room-booked/room-booked.component';
import { ReservationComponent } from './pages/reservation/reservation.component';
import { InvoiceComponent } from './pages/invoice/invoice.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { SalaryComponent } from './pages/salary/salary.component';
import { EmployeeComponent } from './pages/employee/employee.component';
import { RoleComponent } from './pages/role/role.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { SignupComponent } from './pages/signup/signup.component';
const routes: Routes = [
    { path: "", redirectTo: "login", pathMatch: "full" },
    {
        path: "login",
        component: LoginAdminComponent,
        data: {
            requiredAuth: false,
        },
        canActivate: [AuthGuard],
    },
    {
        path: "dashboard",
        component: LayoutpageComponent,
        data: {
            requiredAuth: true,
        },
        canActivate: [AuthGuard],
    },
    {
        path: "signup",
        component: SignupComponent,
        data: {
            requiredAuth: false,
        },
        canActivate: [AuthGuard],
    },
    {
        path: "login",
        loadChildren: () =>
            import("../../admin/admin.module").then((m) => m.AdminModule),
    },
    {
        path: "signup",
        loadChildren: () =>
            import("../../signup/signup.module").then((m) => m.SignupModule),
    },
    {
        path: "dashboard",
        loadChildren: () =>
            import("../../dashboard/dashboard.module").then(
                (m) => m.DashboardModule
            ),
    },
    {
        path: "room",
        component: RoomComponent,
        data: {
            requiredAuth: true,
        },
        canActivate: [AuthGuard],
    },
    {
        path: "roomtype",
        component: RoomtypeComponent,
        data: {
            requiredAuth: true,
        },
        canActivate: [AuthGuard],
    },
    {
        path: "salary",
        component: SalaryComponent,
        data: {
            requiredAuth: true,
        },
        canActivate: [AuthGuard],
    },
    {
        path: "blog",
        component: BlogComponent,
        data: {
            requiredAuth: true,
        },
        canActivate: [AuthGuard],
    },
    {
        path: "roomservice",
        component: RoomTypeServiceComponent,
        data: {
            requiredAuth: true,
        },
        canActivate: [AuthGuard],
    },
    {
        path: "typeservice",
        component: RoomservicesComponent,
        data: {
            requiredAuth: true,
        },
        canActivate: [AuthGuard],
    },
    {
        path: "booking",
        component: BookingComponent,
        data: {
            requiredAuth: true,
        },
        canActivate: [AuthGuard],
    },
    {
        path: "customer",
        component: CustomerComponent,
        data: {
            requiredAuth: true,
        },
        canActivate: [AuthGuard],
    },
    {
        path: "role",
        component: RoleComponent,
        data: {
            requiredAuth: true,
            requiredAdmin: true,
        },
        canActivate: [AuthGuard],
    },
    {
        path: "employee",
        component: EmployeeComponent,
        data: {
            requiredAuth: true,
        },
        canActivate: [AuthGuard],
    },
    {
        path: "invoice",
        component: InvoiceComponent,
        data: {
            requiredAuth: true,
        },
        canActivate: [AuthGuard],
    },

    {
        path: "room-booked",
        component: RoomBookedComponent,
        data: {
            requiredAuth: true,
        },
        canActivate: [AuthGuard],
    },
    {
        path: "revenue",
        component: RevenueComponent,
        data: {
            requiredAuth: true,
        },
        canActivate: [AuthGuard],
    },
    {
        path: "discount",
        component: DiscountComponent,
        data: {
            requiredAuth: true,
        },
        canActivate: [AuthGuard],
    },
    {
        path: "reservation",
        component: ReservationComponent,
        data: {
            requiredAuth: true,
        },
        canActivate: [AuthGuard],
    },
    {
        path: "checkout/:reservationId/:roomId",
        component: CheckoutComponent,
        data: {
            requiredAuth: true,
        },
        canActivate: [AuthGuard],
    },
    {
        path: "checkout-detail/reservationId",
        component: CheckoutComponent,
        data: {
            requiredAuth: true,
        },
        canActivate: [AuthGuard],
    },
    {
        path: "user-profile",
        component: UserProfileComponent,
        data: {
            requiredAuth: true,
        },
        canActivate: [AuthGuard],
    },
    {
        path: "**",
        component: PageErrorComponent,
        data: {
            requiredAuth: false,
        },
        canActivate: [AuthGuard],
    },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
