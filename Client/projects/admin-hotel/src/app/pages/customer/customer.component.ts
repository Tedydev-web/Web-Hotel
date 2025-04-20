import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../../_service/api.service';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { Observable, of, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment.development';
import { catchError, retry, tap, timeout } from 'rxjs/operators';

// Interface tạm thời cho CustomerModel nếu không tìm thấy file
export interface CustomerModel {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    address?: string;
    userName?: string;
    status: 'active' | 'inactive' | 'blocked';
    createdAt: string;
    updatedAt?: string;
    image?: string;
    emailConfirmed?: boolean;
    bookings?: any[];
}

// Mở rộng interface Staff để bao gồm các thuộc tính cần thiết
export interface Staff {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    address?: string;
    status: 'active' | 'inactive' | 'blocked';
    createdAt: string;
    updatedAt?: string;
    image?: string;
    emailConfirmed?: boolean;
    bookingsCount?: number;
    bookings?: any[];
    [key: string]: any; // Cho phép các thuộc tính động khác
}

// Service để giao tiếp với API khách hàng
@Injectable({
    providedIn: 'root'
})
export class CustomerService {
    private apiUrl: string;
    private timeoutValue = 30000; // 30 seconds timeout

    constructor(private http: HttpClient, private apiService: ApiService) { 
        // Lấy URL API từ environment hoặc sử dụng giá trị mặc định
        const baseUrl = environment.BASE_URL_API || 'http://localhost:7000/api';
        this.apiUrl = `${baseUrl}/v2/admin/customer`;
        console.log('CustomerService initialized with API URL:', this.apiUrl);
    }

    getAllCustomers(): Observable<Staff[]> {
        console.log('Getting all customers from:', `${this.apiUrl}/get-all`);
        return this.http.get<Staff[]>(`${this.apiUrl}/get-all`)
            .pipe(
                timeout(this.timeoutValue),
                retry(2),
                tap(response => {
                    console.log('Customer data received:', response);
                    if (!response || response.length === 0) {
                        console.warn('Received empty customer data');
                    }
                }),
                catchError(this.handleError)
            );
    }

    getCustomerById(id: string): Observable<Staff> {
        console.log('Getting customer by ID:', id);
        return this.http.get<Staff>(`${this.apiUrl}/get-by-id?id=${id}`)
            .pipe(
                timeout(this.timeoutValue),
                retry(1),
                tap(response => console.log('Customer detail received:', response)),
                catchError(this.handleError)
            );
    }

    createCustomer(customer: any): Observable<any> {
        console.log('Creating customer:', customer);
        return this.http.post<any>(`${this.apiUrl}/create`, customer)
            .pipe(
                timeout(this.timeoutValue),
                tap(response => console.log('Create customer response:', response)),
                catchError(this.handleError)
            );
    }

    updateCustomer(customer: any): Observable<any> {
        console.log('Updating customer:', customer);
        return this.http.post<any>(`${this.apiUrl}/update?id=${customer.id}`, customer)
            .pipe(
                timeout(this.timeoutValue),
                tap(response => console.log('Update customer response:', response)),
                catchError(this.handleError)
            );
    }

    updateCustomerStatus(id: string, status: string): Observable<any> {
        console.log('Updating customer status:', id, status);
        return this.http.post<any>(`${this.apiUrl}/update-status?id=${id}`, { status })
            .pipe(
                timeout(this.timeoutValue),
                tap(response => console.log('Update status response:', response)),
                catchError(this.handleError)
            );
    }

    deleteCustomer(id: string): Observable<any> {
        console.log('Deleting customer:', id);
        return this.http.get<any>(`${this.apiUrl}/delete?id=${id}`)
            .pipe(
                timeout(this.timeoutValue),
                tap(response => console.log('Delete customer response:', response)),
                catchError(this.handleError)
            );
    }

    private handleError(error: HttpErrorResponse) {
        let errorMessage = 'Đã có lỗi xảy ra';
        
        if (error.error instanceof ErrorEvent) {
            // Client-side error
            errorMessage = `Lỗi: ${error.error.message}`;
            console.error('Client-side error:', error.error.message);
        } else {
            // Server-side error
            errorMessage = `Mã lỗi: ${error.status}\nThông báo: ${error.message}`;
            console.error('Server-side error:', {
                status: error.status,
                message: error.message,
                error: error.error
            });
        }
        
        console.error('Full error object:', error);
        return throwError(() => new Error(errorMessage));
    }
}

@Component({
    selector: 'app-customer',
    templateUrl: './customer.component.html',
    styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit, OnDestroy {
    Accounts: Staff[] = [];
    roomTypeResult: Staff[] = [];
    customerGetAll: Staff[] = [];
    customerGetById: any;
    filteredCustomers: Staff[] = [];
    paginatedCustomers: Staff[] = [];
    numAccount!: number;
    numbBookings!: number;
    revenueTotal!: number;
    searchTerm: string = '';
    searchCustomer: string = '';
    statusFilter: string = 'all';
    dateFrom: string = '';
    dateTo: string = '';
    showFilters: boolean = false;
    currentPage: number = 1;
    pageSize: number = 10;
    totalPages: number = 1;
    viewMode: string = 'table';
    isLoading: boolean = false;
    isLoadingDetail: boolean = false;
    isEditMode: boolean = false;
    isSubmitting: boolean = false;
    errorMessage: string = '';
    customerForm!: FormGroup;
    submitted: boolean = false;
    selectedCustomer: Staff | null = null;

    // Dữ liệu mẫu dùng khi không thể kết nối API
    mockCustomerData: Staff[] = [
        {
            id: '1',
            name: 'Nguyễn Văn A',
            email: 'nguyenvana@example.com',
            phoneNumber: '0901234567',
            address: 'Hà Nội, Việt Nam',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            image: './assets/images/default-avatar.jpg',
            emailConfirmed: true,
            bookingsCount: 5,
            bookings: []
        },
        {
            id: '2',
            name: 'Trần Thị B',
            email: 'tranthib@example.com',
            phoneNumber: '0912345678',
            address: 'Hồ Chí Minh, Việt Nam',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            image: './assets/images/default-avatar.jpg',
            emailConfirmed: true,
            bookingsCount: 3,
            bookings: []
        },
        {
            id: '3',
            name: 'Lê Văn C',
            email: 'levanc@example.com',
            phoneNumber: '0823456789',
            address: 'Đà Nẵng, Việt Nam',
            status: 'inactive',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            image: './assets/images/default-avatar.jpg',
            emailConfirmed: false,
            bookingsCount: 0,
            bookings: []
        }
    ];

    constructor(
        private router: Router,
        private customerService: CustomerService,
        private apiService: ApiService,
        private toastr: ToastrService,
        private fb: FormBuilder
    ) { 
        console.log('CustomerComponent initialized');
        // Debug thông tin môi trường
        this.debugEnvironmentInfo();
    }

    // Debug thông tin môi trường
    debugEnvironmentInfo() {
        console.log('Environment info:');
        console.log('- BASE_URL_API:', environment.BASE_URL_API);
        console.log('- Window location:', window.location.href);
        console.log('- Navigator:', navigator.userAgent);
    }

    ngOnInit(): void {
        console.log('CustomerComponent ngOnInit started');
        this.loadCustomerData();
        this.initCustomerForm();
        
        // Đăng ký xử lý sự kiện khi người dùng truy cập tab này
        window.addEventListener('focus', this.onWindowFocus.bind(this));
    }
    
    ngOnDestroy(): void {
        // Hủy đăng ký sự kiện khi component bị hủy
        window.removeEventListener('focus', this.onWindowFocus.bind(this));
    }
    
    onWindowFocus(): void {
        // Nếu đã quá 5 phút kể từ lần tải dữ liệu cuối cùng, tải lại dữ liệu
        const lastLoadTime = localStorage.getItem('customerLastLoadTime');
        if (lastLoadTime) {
            const fiveMinutesAgo = new Date().getTime() - 5 * 60 * 1000;
            if (parseInt(lastLoadTime) < fiveMinutesAgo) {
                console.log('Reloading customer data after timeout');
                this.loadCustomerData();
            }
        }
    }
    
    loadCustomerData(): void {
        this.isLoading = true;
        
        // Lưu thời gian tải dữ liệu
        localStorage.setItem('customerLastLoadTime', new Date().getTime().toString());
        
        // Kiểm tra xem API endpoint có tồn tại
        console.log('API URL:', environment.BASE_URL_API);
        
        // Thiết lập timeout để đảm bảo không bị kẹt quá lâu
        const timeout = setTimeout(() => {
            if (this.isLoading) {
                console.warn('API request timeout. Using alternative method.');
                this.isLoading = false;
                this.tryAlternativeDataLoad();
            }
        }, 10000); // 10 giây
        
        this.customerService.getAllCustomers().subscribe(
            (res: Staff[]) => {
                clearTimeout(timeout);
                console.log('Customer data loaded successfully:', res);
                
                if (res && res.length > 0) {
                    this.Accounts = res;
                    this.roomTypeResult = this.Accounts;
                    this.customerGetAll = this.Accounts;
                    this.filteredCustomers = this.Accounts;
                    this.updatePagination();
                    this.toastr.success(`Đã tải ${this.Accounts.length} khách hàng thành công`);
                } else {
                    console.warn('Received empty customer data');
                    this.tryAlternativeDataLoad();
                }
                
                this.isLoading = false;
            },
            (error: any) => {
                clearTimeout(timeout);
                console.error('Error loading customer data:', error);
                // Không hiển thị thông báo lỗi ở đây, để phương thức thay thế xử lý thông báo
                this.isLoading = false;
                
                // Thử phương thức thay thế bằng cách sử dụng ApiService
                this.tryAlternativeDataLoad();
            }
        );
    }
    
    // Phương thức thay thế để tải dữ liệu khi API chính không hoạt động
    tryAlternativeDataLoad() {
        console.log('Trying alternative data load method...');
        
        // Thử sử dụng API service để lấy danh sách người dùng
        this.apiService.getallUser().subscribe(
            (res: any[]) => {
                console.log('Alternative data load successful:', res);
                // Chuyển đổi từ model Staff của API service sang model Staff của component
                const transformedData = res.map(user => {
                    return {
                        id: user.id || '',
                        name: user.name || '',
                        email: user.email || '',
                        phoneNumber: user.phoneNumber || '',
                        address: user.address || '',
                        status: user.lockoutEnabled === 'false' ? 'active' : 'inactive', // Chuyển đổi trạng thái
                        createdAt: user.createdAt || new Date().toISOString(),
                        updatedAt: user.updatedAt,
                        image: user.image || '',
                        emailConfirmed: user.emailConfirmed === 'true',
                        bookingsCount: 0,
                        bookings: []
                    } as Staff;
                });
                
                this.Accounts = transformedData;
                this.roomTypeResult = this.Accounts;
                this.customerGetAll = this.Accounts;
                this.filteredCustomers = this.Accounts;
                this.updatePagination();
                this.isLoading = false;
                
                if (this.Accounts.length > 0) {
                    this.toastr.success(`Đã tải ${this.Accounts.length} khách hàng thành công`);
                } else {
                    // Nếu không có dữ liệu, sử dụng dữ liệu mẫu
                    this.useMockData();
                }
            },
            (error: any) => {
                console.error('Alternative data load also failed:', error);
                this.isLoading = false;
                this.toastr.error('Không thể kết nối đến máy chủ. Sử dụng dữ liệu mẫu.');
                
                // Sử dụng dữ liệu mẫu khi không thể kết nối API
                this.useMockData();
            }
        );
    }
    
    // Sử dụng dữ liệu mẫu khi không thể kết nối API
    useMockData() {
        console.log('Using mock customer data');
        
        // Đường dẫn ảnh mặc định đúng
        const defaultImage = './assets/images/default-avatar.jpg';
        
        // Cập nhật đường dẫn ảnh trong dữ liệu mẫu
        this.mockCustomerData.forEach(customer => {
            customer.image = defaultImage;
        });
        
        this.Accounts = [...this.mockCustomerData];
        this.roomTypeResult = this.Accounts;
        this.customerGetAll = this.Accounts;
        this.filteredCustomers = this.Accounts;
        this.updatePagination();
        this.toastr.warning('Đang sử dụng dữ liệu mẫu. Một số chức năng có thể bị hạn chế.');
    }

    initCustomerForm(): void {
        this.isEditMode = false;
        this.customerForm = this.fb.group({
            id: [''],
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phoneNumber: ['', Validators.required],
            address: [''],
            status: ['active'],
            image: [''],
            emailConfirmed: [false],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required]
        }, {
            validators: this.passwordMatchValidator
        });
    }

    // Phương thức xác thực mật khẩu
    passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
        const password = control.get('password');
        const confirmPassword = control.get('confirmPassword');
        
        if (password && confirmPassword && password.value !== confirmPassword.value) {
            return { passwordMismatch: true };
        }
        
        return null;
    }

    get f() { return this.customerForm.controls; }

    onSubmit() {
        this.submitted = true;
        if (this.customerForm.invalid) {
            return;
        }

        this.isSubmitting = true;
        const formData = this.customerForm.value;

        if (this.isEditMode) {
            this.customerService.updateCustomer(formData).subscribe(
                (res: any) => {
                    this.isSubmitting = false;
                    this.resetForm();
                    this.ngOnInit();
                    this.toastr.success('Cập nhật khách hàng thành công');
                },
                (error: any) => {
                    this.isSubmitting = false;
                    this.errorMessage = 'Có lỗi xảy ra khi cập nhật khách hàng';
                    this.toastr.error(this.errorMessage);
                }
            );
        } else {
            this.customerService.createCustomer(formData).subscribe(
                (res: any) => {
                    this.isSubmitting = false;
                    this.resetForm();
                    this.ngOnInit();
                    this.toastr.success('Tạo khách hàng mới thành công');
                },
                (error: any) => {
                    this.isSubmitting = false;
                    this.errorMessage = 'Có lỗi xảy ra khi tạo khách hàng mới';
                    this.toastr.error(this.errorMessage);
                }
            );
        }
    }

    saveCustomer() {
        this.onSubmit();
    }

    resetForm() {
        this.submitted = false;
        this.errorMessage = '';
        this.isEditMode = false;
        this.customerForm.reset({
            status: 'active'
        });
    }

    editCustomer(customer: Staff | null) {
        if (!customer) {
            this.toastr.error('Không tìm thấy thông tin khách hàng');
            return;
        }
        
        this.isEditMode = true;
        this.customerForm.patchValue({
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phoneNumber: customer.phoneNumber,
            address: customer.address,
            status: customer.status || 'active',
            image: customer.image
        });

        this.customerForm.get('password')?.clearValidators();
        this.customerForm.get('confirmPassword')?.clearValidators();
        this.customerForm.get('password')?.updateValueAndValidity();
        this.customerForm.get('confirmPassword')?.updateValueAndValidity();
    }

    GetCustomerById(id: string) {
        this.isLoadingDetail = true;
        this.customerGetById = null;
        this.customerService.getCustomerById(id).subscribe(
            (res: Staff) => {
                this.customerGetById = res;
                this.customerForm.patchValue(res);
                this.isLoadingDetail = false;
            },
            (error: any) => {
                this.isLoadingDetail = false;
                this.toastr.error('Không thể tải thông tin khách hàng');
            }
        );
    }

    getCustomerDetail(id: string) {
        this.isLoadingDetail = true;
        this.selectedCustomer = null;
        this.customerService.getCustomerById(id).subscribe(
            (res: Staff) => {
                this.selectedCustomer = res;
                this.isLoadingDetail = false;
            },
            (error: any) => {
                console.error('Lỗi khi tải thông tin khách hàng:', error);
                this.isLoadingDetail = false;
                this.toastr.error('Không thể tải thông tin khách hàng. Vui lòng thử lại sau.');
            }
        );
    }

    getTotalBookings(): number {
        if (!this.Accounts || !this.Accounts.length) return 0;
        return this.Accounts.reduce((total, customer) => {
            return total + (customer['bookingsCount'] || 0);
        }, 0);
    }

    updateStatus(id: string, newStatus: string | boolean) {
        // Chuyển đổi boolean sang string status
        const status = typeof newStatus === 'boolean' 
            ? (newStatus ? 'active' : 'inactive')
            : newStatus;
            
        this.isLoading = true;
        this.customerService.updateCustomerStatus(id, status).subscribe(
            (res: any) => {
                this.isLoading = false;
                this.ngOnInit();
                this.toastr.success('Cập nhật trạng thái thành công');
            },
            (error: any) => {
                this.isLoading = false;
                this.errorMessage = 'Có lỗi xảy ra khi cập nhật trạng thái';
                this.toastr.error(this.errorMessage);
            }
        );
    }

    deleteCustomer(id: string) {
        if (confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
            this.isLoading = true;
            this.customerService.deleteCustomer(id).subscribe(
                (res: any) => {
                    this.isLoading = false;
                    this.ngOnInit();
                    this.toastr.success('Xóa khách hàng thành công');
                },
                (error: any) => {
                    this.isLoading = false;
                    this.errorMessage = 'Có lỗi xảy ra khi xóa khách hàng';
                    this.toastr.error(this.errorMessage);
                }
            );
        }
    }

    searchBookings() {
        try {
            const searchTerm = this.searchTerm.toLowerCase();
            this.Accounts = this.roomTypeResult.filter((item) =>
                item.name.toLowerCase().includes(searchTerm) ||
                item.email.includes(searchTerm) ||
                item.phoneNumber.toString().includes(searchTerm)
            );
            this.searchTerm = '';
            this.updatePagination();
        } catch (error) {
            console.error('Lỗi khi tìm kiếm:', error);
            this.toastr.error('Có lỗi xảy ra khi tìm kiếm');
        }
    }

    clearSearch() {
        try {
            this.Accounts = this.roomTypeResult;
            this.updatePagination();
        } catch (error) {
            console.error('Lỗi khi xóa tìm kiếm:', error);
            this.toastr.error('Có lỗi xảy ra khi xóa tìm kiếm');
        }
    }

    toggleFilterSection() {
        this.showFilters = !this.showFilters;
    }

    applyFilters() {
        this.isLoading = true;
        try {
            let filtered = [...this.customerGetAll];

            if (this.searchCustomer) {
                const term = this.searchCustomer.toLowerCase();
                filtered = filtered.filter(customer => 
                    customer.name.toLowerCase().includes(term) ||
                    customer.email.toLowerCase().includes(term) ||
                    (customer.phoneNumber && customer.phoneNumber.toString().includes(term)) ||
                    (customer.id && customer.id.toLowerCase().includes(term))
                );
            }

            if (this.statusFilter !== 'all') {
                filtered = filtered.filter(customer => customer.status === this.statusFilter);
            }

            if (this.dateFrom) {
                const fromDate = new Date(this.dateFrom);
                filtered = filtered.filter(customer => new Date(customer.createdAt) >= fromDate);
            }

            if (this.dateTo) {
                const toDate = new Date(this.dateTo);
                toDate.setHours(23, 59, 59);
                filtered = filtered.filter(customer => new Date(customer.createdAt) <= toDate);
            }

            this.filteredCustomers = filtered;
            this.currentPage = 1;
            this.updatePagination();
        } catch (error) {
            console.error('Lỗi khi áp dụng bộ lọc:', error);
            this.toastr.error('Có lỗi xảy ra khi áp dụng bộ lọc');
        } finally {
            this.isLoading = false;
        }
    }

    clearFilters() {
        try {
            this.searchCustomer = '';
            this.statusFilter = 'all';
            this.dateFrom = '';
            this.dateTo = '';
            this.filteredCustomers = this.customerGetAll;
            this.currentPage = 1;
            this.updatePagination();
        } catch (error) {
            console.error('Lỗi khi xóa bộ lọc:', error);
            this.toastr.error('Có lỗi xảy ra khi xóa bộ lọc');
        }
    }

    getNewCustomersCount(days: number): number {
        if (!this.customerGetAll || !this.customerGetAll.length) return 0;
        
        const currentDate = new Date();
        const pastDate = new Date();
        pastDate.setDate(currentDate.getDate() - days);
        
        return this.customerGetAll.filter(customer => 
            new Date(customer.createdAt) >= pastDate
        ).length;
    }

    setViewMode(mode: string) {
        this.viewMode = mode;
    }

    exportData() {
        const dataToExport = this.filteredCustomers.map(customer => {
            return {
                'ID': customer.id,
                'Họ tên': customer.name,
                'Email': customer.email,
                'Số điện thoại': customer.phoneNumber,
                'Địa chỉ': customer.address || 'N/A',
                'Trạng thái': customer.status === 'active' ? 'Hoạt động' : 
                             (customer.status === 'inactive' ? 'Không hoạt động' : 'Bị chặn'),
                'Ngày tham gia': new Date(customer.createdAt).toLocaleDateString('vi-VN')
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Khách hàng');
        
        const maxWidth = dataToExport.reduce((w, r) => Math.max(w, r['Họ tên'].length), 10);
        worksheet['!cols'] = [
            { width: 10 },
            { width: maxWidth },
            { width: 25 },
            { width: 15 },
            { width: 30 },
            { width: 15 },
            { width: 12 }
        ];

        XLSX.writeFile(workbook, 'danh_sach_khach_hang.xlsx');
    }

    sortBy(criterion: string) {
        switch(criterion) {
            case 'newest':
                this.filteredCustomers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
            case 'oldest':
                this.filteredCustomers.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                break;
            case 'nameAsc':
                this.filteredCustomers.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'nameDesc':
                this.filteredCustomers.sort((a, b) => b.name.localeCompare(a.name));
                break;
        }
        this.updatePagination();
    }

    updatePagination() {
        this.totalPages = Math.ceil(this.filteredCustomers.length / this.pageSize);
        const startIndex = (this.currentPage - 1) * this.pageSize;
        this.paginatedCustomers = this.filteredCustomers.slice(startIndex, startIndex + this.pageSize);
    }

    goToPage(page: number | string) {
        if (page === '...') {
            return;
        }
        
        let pageNumber: number;
        if (typeof page === 'string') {
            pageNumber = parseInt(page, 10);
        } else {
            pageNumber = page;
        }
        
        if (pageNumber < 1) pageNumber = 1;
        if (pageNumber > this.totalPages) pageNumber = this.totalPages;
        
        this.currentPage = pageNumber;
        this.updatePagination();
    }

    getPageNumbers(): any[] {
        const pages = [];
        const totalPages = this.totalPages;
        const currentPage = this.currentPage;
        
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 5; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 4; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }
        
        return pages;
    }
}