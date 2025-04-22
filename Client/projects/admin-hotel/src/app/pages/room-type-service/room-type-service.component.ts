import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../_service/api.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RoomTypeService } from '../../models/roomtypeservice.model';
import { environment } from '../../environments/environment.development';
import * as XLSX from 'xlsx';
declare var bootstrap: any;

@Component({
    selector: 'app-room-type-service',
    templateUrl: './room-type-service.component.html',
    styleUrls: ['./room-type-service.component.css']
})
export class RoomTypeServiceComponent implements OnInit {
    // Data
    imagePreviewUrl!: string | ArrayBuffer | null;
    picture!: any;
    id!: number;
    roomType!: RoomTypeService[];
    roomTypeResult!: RoomTypeService[];
    filteredServices: RoomTypeService[] = [];
    serviceCache: RoomTypeService[] = [];
    deleteId: number | null = null;

    // Form
    serviceForm!: FormGroup;
    
    // Search and filters
    searchTerm: string = '';
    statusFilter: string = 'all';
    priceFilter: string = 'all';
    showFilters: boolean = false;

    // View settings
    viewMode: 'card' | 'table' = 'card';
    
    // Pagination
    pageSize: number = 10;
    currentPage: number = 1;
    totalPages: number = 1;
    
    // Loading state
    isLoading: boolean = false;

    constructor(
        private api: ApiService, 
        private http: HttpClient, 
        private fb: FormBuilder, 
        private toast: ToastrService
    ) {
        this.initServiceForm();
    }
    
    ngOnInit(): void {
        this.isLoading = true;
        this.getAll();
    }

    initServiceForm() {
        this.serviceForm = this.fb.group({
            name: ['', Validators.required],
            price: ['', [Validators.required, Validators.min(0)]],
            amount: ['', [Validators.required, Validators.min(1)]],
            picture: ['']
        });
    }

    getAll() {
        return this.api.getAllRoomTypeService().subscribe(res => {
            this.roomType = res;
            this.roomTypeResult = res;
            this.serviceCache = [...res];
            this.applyFilters();
            this.isLoading = false;
        }, error => {
            this.toast.error('Lỗi khi tải dữ liệu: ' + error.message);
            this.isLoading = false;
        });
    }

    searchBookings() {
        if (!this.searchTerm.trim()) {
            this.getAll();
            return;
        }
        
        const searchTerm = this.searchTerm.toLowerCase();
        this.filteredServices = this.serviceCache.filter(item =>
            item.name.toLowerCase().includes(searchTerm)
        );
        
        this.calculateTotalPages();
        this.currentPage = 1;
        this.applyPagination();
    }

    clearSearch() {
        this.searchTerm = '';
        this.applyFilters();
    }

    toggleSelection(id: number) {
        this.id = id;
    }

    createRoomType(serviceForm: FormGroup) {
        if (serviceForm.invalid) {
            Object.keys(serviceForm.controls).forEach(key => {
                serviceForm.controls[key].markAsTouched();
            });
            this.toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        this.isLoading = true;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        const requestData = {
            name: serviceForm.controls['name'].value,
            price: serviceForm.controls['price'].value,
            amount: serviceForm.controls['amount'].value,
            picture: serviceForm.controls['picture'].value
        };
        
        this.http
            .post<any>(
                environment.BASE_URL_API + "/v2/admin/service-room/create",
                requestData,
                httpOptions
            )
            .subscribe(
                (response) => {
                    this.toast.success("Thêm dịch vụ phòng thành công!");
                    this.getAll();
                    this.resetForm();
                    document.querySelector('[data-bs-dismiss="modal"]')?.dispatchEvent(new Event('click'));
                    this.isLoading = false;
                },
                (error) => {
                    this.toast.error("Lỗi: " + error.error.message);
                    this.isLoading = false;
                }
            );
    }

    fetchModal(service?: RoomTypeService) {
        if (service) {
            this.serviceForm.patchValue({
                name: service.name,
                price: service.price,
                amount: service.amount,
                picture: service.picture
            });
        }
    }
    
    updateRoomType(serviceForm: FormGroup) {
        if (serviceForm.invalid) {
            Object.keys(serviceForm.controls).forEach(key => {
                serviceForm.controls[key].markAsTouched();
            });
            this.toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        this.isLoading = true;
        this.api.updateRoomTypeService(serviceForm.value, this.id).subscribe(res => {
            this.toast.success("Cập nhật thành công!");
            this.getAll();
            this.resetForm();
            document.querySelector('[data-bs-dismiss="modal"]')?.dispatchEvent(new Event('click'));
            this.isLoading = false;
        }, err => {
            this.toast.error("Lỗi: " + err.message);
            this.isLoading = false;
        });
    }

    uploadFileDetail = (event: any) => {
        let files = event.target.files;
        if (files.length === 0) {
            return;
        }
        if (files.length > 0) {
            this.picture = files;
            const reader = new FileReader();
            reader.onload = () => {
                this.imagePreviewUrl = reader.result;
            };
            reader.readAsDataURL(files[0]);
            const serviceImageControl = this.serviceForm.get('picture');
            if (serviceImageControl) {
                serviceImageControl.updateValueAndValidity();
            }
        }
    };

    confirmDelete(id: number) {
        this.deleteId = id;
        const modal = new bootstrap.Modal(document.getElementById('delete-confirmation-modal'));
        modal.show();
    }

    deleteService() {
        if (!this.deleteId) return;
        
        this.isLoading = true;
        this.api.deleteRoomTypeService(this.deleteId).subscribe(res => {
            this.toast.success("Xóa dịch vụ phòng thành công!");
            this.getAll();
            this.deleteId = null;
            this.isLoading = false;
        }, err => {
            this.toast.error("Lỗi: " + err.message);
            this.isLoading = false;
        });
    }

    editService(service: RoomTypeService) {
        this.id = +service.id;
        this.fetchModal(service);
    }

    resetForm() {
        this.serviceForm.reset();
        this.id = 0;
        this.imagePreviewUrl = null;
    }

    // Filtering and pagination
    toggleFilterSection() {
        this.showFilters = !this.showFilters;
    }

    clearFilters() {
        this.searchTerm = '';
        this.statusFilter = 'all';
        this.priceFilter = 'all';
        this.applyFilters();
    }

    applyFilters() {
        let filtered = [...this.serviceCache];
        
        // Filter by search text
        if (this.searchTerm.trim()) {
            const searchTerm = this.searchTerm.toLowerCase();
            filtered = filtered.filter(service => 
                service.name.toLowerCase().includes(searchTerm)
            );
        }
        
        // Filter by price range
        if (this.priceFilter !== 'all') {
            switch(this.priceFilter) {
                case 'low':
                    filtered = filtered.filter(service => service.price < 500000);
                    break;
                case 'medium':
                    filtered = filtered.filter(service => service.price >= 500000 && service.price < 1000000);
                    break;
                case 'high':
                    filtered = filtered.filter(service => service.price >= 1000000);
                    break;
            }
        }
        
        // Set filtered data
        this.filteredServices = [...filtered];
        this.calculateTotalPages();
        this.currentPage = 1;
        this.applyPagination();
    }

    // Pagination
    applyPagination() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        
        if (this.viewMode === 'table') {
            this.filteredServices = this.filteredServices.slice(startIndex, endIndex);
        }
    }

    calculateTotalPages() {
        this.totalPages = Math.ceil(this.filteredServices.length / this.pageSize);
    }

    goToPage(page: number) {
        if (page < 1 || page > this.totalPages) {
            return;
        }
        this.currentPage = page;
        this.applyPagination();
    }

    getPageNumbers(): number[] {
        const pages: number[] = [];
        
        if (this.totalPages <= 5) {
            for (let i = 1; i <= this.totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (this.currentPage <= 3) {
                for (let i = 1; i <= 5; i++) {
                    pages.push(i);
                }
            } else if (this.currentPage >= this.totalPages - 2) {
                for (let i = this.totalPages - 4; i <= this.totalPages; i++) {
                    pages.push(i);
                }
            } else {
                for (let i = this.currentPage - 2; i <= this.currentPage + 2; i++) {
                    pages.push(i);
                }
            }
        }
        
        return pages;
    }

    // View mode
    setViewMode(mode: 'card' | 'table') {
        this.viewMode = mode;
        this.applyPagination();
    }

    // Sorting
    sortBy(criteria: string) {
        let sorted = [...this.filteredServices];
        
        switch (criteria) {
            case 'nameAsc':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'nameDesc':
                sorted.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'priceAsc':
                sorted.sort((a, b) => a.price - b.price);
                break;
            case 'priceDesc':
                sorted.sort((a, b) => b.price - a.price);
                break;
        }
        
        this.filteredServices = sorted;
    }

    // Export data
    exportData() {
        const data = this.serviceCache.map(service => {
            return {
                'ID': service.id,
                'Tên dịch vụ phòng': service.name,
                'Giá': service.price,
                'Số lượng': service.amount,
                'Giá khuyến mãi': service.priceDiscount || 'Không có'
            };
        });
        
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Dịch vụ phòng');
        
        // Export to Excel
        XLSX.writeFile(workbook, 'danh-sach-dich-vu-phong.xlsx');
    }

    // Dashboard metrics
    getTotalRoomTypeServices(): number {
        return this.roomType?.length || 0;
    }
    
    getActiveServicesCount(): number {
        return this.getTotalRoomTypeServices();
    }
    
    getDiscountedServicesCount(): number {
        return this.serviceCache.filter(service => service.priceDiscount && service.priceDiscount > 0).length;
    }
    
    getTotalValue(): number {
        if (!this.serviceCache || this.serviceCache.length === 0) return 0;
        
        return this.serviceCache.reduce((sum, service) => {
            const actualPrice = service.priceDiscount && service.priceDiscount > 0 ? service.priceDiscount : service.price;
            return sum + (actualPrice * service.amount);
        }, 0);
    }
}
