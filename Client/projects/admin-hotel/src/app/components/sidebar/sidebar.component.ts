import { Component, OnInit, ViewEncapsulation, HostListener, Renderer2 } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { User } from '../../_service/user.model';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class SidebarComponent implements OnInit {
    showCustomers = false;
    roleAccount!: any;
    roleValue: string = '';
    isLocalAdmin: boolean = false;
    isLocalBoth: boolean = false;
    isManagementExpanded: boolean = false;
    isMobileView: boolean = false;
    isSidebarOpen: boolean = false;

    constructor(
        private jwt: JwtHelperService,
        private router: Router,
        private renderer: Renderer2
    ) {
        // Theo dõi thay đổi route để cập nhật trạng thái menu
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe((event: any) => {
            this.checkActiveRoute(event.url);
        });

        // Đóng sidebar khi click bên ngoài trên mobile
        this.renderer.listen('window', 'click', (e: Event) => {
            if (this.isMobileView && this.isSidebarOpen) {
                const target = e.target as HTMLElement;
                const sidebar = document.querySelector('.sidebar-container');
                const sidebarToggle = document.querySelector('.sidebar-toggle');
                
                if (sidebar && !sidebar.contains(target) && sidebarToggle && !sidebarToggle.contains(target)) {
                    this.closeSidebarOnMobile();
                }
            }
        });
    }

    ngOnInit(): void {
        // Lấy vai trò người dùng từ localStorage
        const getRole = localStorage.getItem('Roletype');
        if (getRole) {
            this.roleValue = getRole;
            this.isLocalAdmin = getRole === 'Admin';
        } else {
            this.roleValue = 'User';
        }
        
        // Kiểm tra kích thước màn hình khi khởi tạo
        this.checkScreenSize();
        
        // Kiểm tra đường dẫn hiện tại để mở menu phù hợp
        this.checkActiveRoute(this.router.url);
    }

    @HostListener('window:resize', ['$event'])
    onResize() {
        this.checkScreenSize();
    }

    checkScreenSize(): void {
        const prevMobileView = this.isMobileView;
        this.isMobileView = window.innerWidth < 992;
        
        // Nếu chuyển từ mobile sang desktop, reset trạng thái sidebar
        if (prevMobileView && !this.isMobileView) {
            this.isSidebarOpen = false;
        }
    }

    checkActiveRoute(url: string): void {
        const managementUrls = ['/roomtype', '/typeservice', '/roomservice', '/customer', 
                               '/employee', '/discount', '/invoice', '/salary', '/role'];
        
        this.isManagementExpanded = managementUrls.some(route => url.includes(route));
    }

    toggleManagement(): void {
        // Chuyển đổi trạng thái menu quản lý
        this.isManagementExpanded = !this.isManagementExpanded;
        
        // Ngăn chặn sự kiện propagation bằng cách xử lý nó ở cấp component
        // thay vì sử dụng tham số event
    }

    // Thêm phương thức đóng sidebar khi chọn menu trên thiết bị di động
    closeSidebarOnMobile(): void {
        if (this.isMobileView) {
            this.isSidebarOpen = false;
        }
    }
    
    // Mở sidebar trên thiết bị di động
    openSidebarOnMobile(): void {
        if (this.isMobileView) {
            this.isSidebarOpen = true;
        }
    }

    // Method để kiểm tra xem submenu có mục đang active không
    hasActiveSubmenuItem(): boolean {
        const currentUrl = this.router.url;
        const managementUrls = ['/roomtype', '/typeservice', '/roomservice', '/customer', 
                               '/employee', '/discount', '/invoice', '/salary', '/role'];
        
        return managementUrls.some(url => currentUrl.includes(url));
    }
}





