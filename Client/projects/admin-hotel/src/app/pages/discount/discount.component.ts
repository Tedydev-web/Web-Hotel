import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../_service/api.service';
import { ToastrService } from 'ngx-toastr';
import { Discount } from '../../models/discount.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import * as XLSX from 'xlsx';
declare var bootstrap: any;

@Component({
    selector: 'app-discount',
    templateUrl: './discount.component.html',
    styleUrls: ['./discount.component.css']
})
export class DiscountComponent implements OnInit {
    // Dữ liệu giảm giá
    discounts!: Discount[];
    filteredDiscounts: Discount[] = [];
    discountCache: Discount[] = [];
    discountTypes: any[] = [];

    // Form và ID
    id!: number;
    discountForm!: FormGroup;
    deleteId: number | null = null;
    
    // Phân trang
    pageSize: number = 10;
    currentPage: number = 1;
    totalPages: number = 1;

    // Bộ lọc
    showFilters: boolean = false;
    searchDiscount: string = '';
    statusFilter: string = 'all';
    typeFilter: number = 0;
    
    // Chế độ xem
    viewMode: 'card' | 'table' = 'card';
    
    // Loading state
    isLoading: boolean = false;
    selectedTypeId: number = 0;

    constructor(
        private api: ApiService, 
        private fb: FormBuilder, 
        private toast: ToastrService,
        private http: HttpClient
    ) {
        this.initDiscountForm();
    }

    ngOnInit(): void {
        this.isLoading = true;
        this.getAllDiscounts();
        this.getAllDiscountTypes();
    }

    initDiscountForm() {
        this.discountForm = this.fb.group({
            discountCode: ['', Validators.required],
            name: ['', Validators.required],
            discountPercent: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
            amountUse: ['', [Validators.required, Validators.min(1)]],
            startAt: ['', Validators.required],
            endAt: ['', Validators.required],
            isPermanent: [false],
            discountTypeId: ['', Validators.required]
        });
    }

    getAllDiscounts() {
        return this.api.getAllDiscount().subscribe(res => {
            this.discounts = res;
            this.discountCache = [...res];
            this.applyFilters();
            this.isLoading = false;
        }, error => {
            this.toast.error('Lỗi khi tải dữ liệu: ' + error.message);
            this.isLoading = false;
        });
    }

    getAllDiscountTypes() {
        this.api.getAllDiscountType().subscribe(res => {
            this.discountTypes = res;
        }, error => {
            this.toast.error('Lỗi khi tải loại giảm giá: ' + error.message);
        });
    }

    toggleSelection(itemId: number) {
        this.id = itemId;
    }

    createDiscount(discountForm: FormGroup) {
        if (discountForm.invalid) {
            Object.keys(discountForm.controls).forEach(key => {
                discountForm.controls[key].markAsTouched();
            });
            this.toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        this.isLoading = true;
        return this.api.createDiscount(discountForm.value).subscribe(res => {
            this.toast.success("Thêm mã giảm giá thành công!");
            this.getAllDiscounts();
            this.resetForm();
            document.querySelector('[data-bs-dismiss="modal"]')?.dispatchEvent(new Event('click'));
            this.isLoading = false;
        }, err => {
            this.toast.error("Lỗi: " + err);
            this.isLoading = false;
        });
    }

    update(discountForm: FormGroup) {
        if (discountForm.invalid) {
            Object.keys(discountForm.controls).forEach(key => {
                discountForm.controls[key].markAsTouched();
            });
            this.toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        this.isLoading = true;
        this.api.updateDiscount(discountForm.value, this.id).subscribe(res => {
            this.toast.success("Cập nhật thành công!");
            this.getAllDiscounts();
            this.resetForm();
            document.querySelector('[data-bs-dismiss="modal"]')?.dispatchEvent(new Event('click'));
            this.isLoading = false;
        }, err => {
            this.toast.error("Lỗi: " + err);
            this.isLoading = false;
        });
    }

    confirmDelete(id: number) {
        this.deleteId = id;
        const modal = new bootstrap.Modal(document.getElementById('delete-confirmation-modal'));
        modal.show();
    }

    deleteDiscount() {
        if (!this.deleteId) return;
        
        this.isLoading = true;
        this.api.deleteDiscount(this.deleteId).subscribe(res => {
            this.toast.success("Xóa mã giảm giá thành công!");
            this.getAllDiscounts();
            this.deleteId = null;
            this.isLoading = false;
        }, err => {
            this.toast.error("Lỗi: " + err);
            this.isLoading = false;
        });
    }

    // Form operations
    editDiscount(discount: Discount) {
        this.id = discount.id;
        // Format dates for form
        const startAt = new Date(discount.startAt).toISOString().substring(0, 10);
        const endAt = new Date(discount.endAt).toISOString().substring(0, 10);
        
        this.discountForm.patchValue({
            discountCode: discount.discountCode,
            name: discount.name,
            discountPercent: discount.discountPercent,
            amountUse: discount.amountUse,
            startAt: startAt,
            endAt: endAt,
            isPermanent: discount.isPermanent,
            discountTypeId: discount.discountTypeId
        });
    }

    resetForm() {
        this.discountForm.reset();
        this.id = 0;
    }

    // Filtering and pagination
    toggleFilterSection() {
        this.showFilters = !this.showFilters;
    }

    clearFilters() {
        this.searchDiscount = '';
        this.statusFilter = 'all';
        this.typeFilter = 0;
        this.applyFilters();
    }

    onTypeChange(event: any) {
        this.typeFilter = parseInt(event.target.value);
        this.applyFilters();
    }

    applyFilters() {
        let filtered = [...this.discountCache];
        
        // Filter by search text
        if (this.searchDiscount.trim()) {
            const searchTerm = this.searchDiscount.toLowerCase();
            filtered = filtered.filter(discount => 
                discount.discountCode.toLowerCase().includes(searchTerm) || 
                discount.name.toLowerCase().includes(searchTerm)
            );
        }
        
        // Filter by status
        if (this.statusFilter !== 'all') {
            const currentDate = new Date();
            if (this.statusFilter === 'active') {
                filtered = filtered.filter(discount => 
                    new Date(discount.startAt) <= currentDate && 
                    new Date(discount.endAt) >= currentDate
                );
            } else if (this.statusFilter === 'expired') {
                filtered = filtered.filter(discount => 
                    new Date(discount.endAt) < currentDate
                );
            } else if (this.statusFilter === 'upcoming') {
                filtered = filtered.filter(discount => 
                    new Date(discount.startAt) > currentDate
                );
            } else if (this.statusFilter === 'permanent') {
                filtered = filtered.filter(discount => 
                    discount.isPermanent === true
                );
            }
        }

        // Filter by type
        if (this.typeFilter > 0) {
            filtered = filtered.filter(discount => discount.discountTypeId === this.typeFilter);
        }
        
        // Set filtered data
        this.filteredDiscounts = [...filtered];
        this.totalPages = Math.ceil(this.filteredDiscounts.length / this.pageSize);
        this.currentPage = 1;
        this.applyPagination();
    }

    // Pagination
    applyPagination() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        
        if (this.viewMode === 'table') {
            this.filteredDiscounts = this.filteredDiscounts.slice(startIndex, endIndex);
        }
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
        let sorted = [...this.filteredDiscounts];
        
        switch (criteria) {
            case 'codeAsc':
                sorted.sort((a, b) => a.discountCode.localeCompare(b.discountCode));
                break;
            case 'codeDesc':
                sorted.sort((a, b) => b.discountCode.localeCompare(a.discountCode));
                break;
            case 'nameAsc':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'nameDesc':
                sorted.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'percentAsc':
                sorted.sort((a, b) => a.discountPercent - b.discountPercent);
                break;
            case 'percentDesc':
                sorted.sort((a, b) => b.discountPercent - a.discountPercent);
                break;
            case 'dateAsc':
                sorted.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
                break;
            case 'dateDesc':
                sorted.sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());
                break;
        }
        
        this.filteredDiscounts = sorted;
    }

    // Export data
    exportData() {
        const data = this.discountCache.map(discount => {
            const discountType = this.discountTypes.find(type => type.id === discount.discountTypeId);
            return {
                'ID': discount.id,
                'Mã giảm giá': discount.discountCode,
                'Tên': discount.name,
                'Phần trăm giảm': discount.discountPercent + '%',
                'Số lượng': discount.amountUse,
                'Ngày bắt đầu': new Date(discount.startAt).toLocaleDateString('vi-VN'),
                'Ngày kết thúc': new Date(discount.endAt).toLocaleDateString('vi-VN'),
                'Vĩnh viễn': discount.isPermanent ? 'Có' : 'Không',
                'Loại giảm giá': discountType ? discountType.name : discount.discountTypeId
            };
        });
        
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Mã giảm giá');
        
        // Export to Excel
        XLSX.writeFile(workbook, 'danh-sach-ma-giam-gia.xlsx');
    }

    // Get discount type name
    getDiscountTypeName(typeId: number): string {
        const type = this.discountTypes.find(t => t.id === typeId);
        return type ? type.name : 'Không xác định';
    }

    // Dashboard metrics
    countActiveDiscounts(): number {
        const currentDate = new Date();
        return this.discountCache.filter(discount => 
            new Date(discount.startAt) <= currentDate && 
            new Date(discount.endAt) >= currentDate
        ).length;
    }
    
    getUsedDiscountCount(): number {
        return this.discountCache.reduce((sum, discount) => sum + (discount.amountUse || 0), 0);
    }

    getAverageDiscountPercent(): string {
        if (!this.discountCache || this.discountCache.length === 0) return '0%';
        const totalPercent = this.discountCache.reduce((sum, discount) => sum + (discount.discountPercent || 0), 0);
        return (totalPercent / this.discountCache.length).toFixed(1) + '%';
    }

    isExpired(discount: Discount): boolean {
        return new Date(discount.endAt) < new Date();
    }

    isActive(discount: Discount): boolean {
        const now = new Date();
        return new Date(discount.startAt) <= now && new Date(discount.endAt) >= now;
    }

    isUpcoming(discount: Discount): boolean {
        return new Date(discount.startAt) > new Date();
    }

    onDiscountTypeChange(event: any) {
        this.selectedTypeId = parseInt(event.target.value);
        this.discountForm.patchValue({
            discountTypeId: this.selectedTypeId
        });
    }
}
