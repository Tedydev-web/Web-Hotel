import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../_service/api.service';
import { ToastrService } from 'ngx-toastr';
import { ServiceAttach } from '../../models/serviceAttach.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import * as XLSX from 'xlsx';
declare var bootstrap: any;

@Component({
  selector: 'app-roomservices',
  templateUrl: './roomservices.component.html',
  styleUrls: ['./roomservices.component.css']
})
export class RoomservicesComponent implements OnInit {
  // Dữ liệu dịch vụ
  roomType!: ServiceAttach[];
  filteredServices: ServiceAttach[] = [];
  serviceCache: ServiceAttach[] = [];

  // Form và ID
  id!: number;
  serviceForm!: FormGroup;
  deleteId: number | null = null;
  
  // Phân trang
  pageSize: number = 10;
  currentPage: number = 1;
  totalPages: number = 1;

  // Bộ lọc
  showFilters: boolean = false;
  searchService: string = '';
  statusFilter: string = 'all';
  
  // Chế độ xem
  viewMode: 'card' | 'table' = 'card';
  
  // Loading state
  isLoading: boolean = false;

  constructor(
    private api: ApiService, 
    private fb: FormBuilder, 
    private toast: ToastrService,
    private http: HttpClient
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
      icon: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  getAll() {
    return this.api.getAllService().subscribe(res => {
      this.roomType = res;
      this.serviceCache = [...res];
      this.applyFilters();
      this.isLoading = false;
    }, error => {
      this.toast.error('Lỗi khi tải dữ liệu: ' + error.message);
      this.isLoading = false;
    });
  }

  toggleSelection(itemId: number) {
    this.id = itemId;
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
    return this.api.createService(serviceForm.value).subscribe(res => {
      this.toast.success("Thêm dịch vụ thành công!");
      this.getAll();
      this.resetForm();
      document.querySelector('[data-bs-dismiss="modal"]')?.dispatchEvent(new Event('click'));
      this.isLoading = false;
    }, err => {
      this.toast.error("Lỗi: " + err);
      this.isLoading = false;
    })
  }

  update(serviceForm: FormGroup) {
    if (serviceForm.invalid) {
      Object.keys(serviceForm.controls).forEach(key => {
        serviceForm.controls[key].markAsTouched();
      });
      this.toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    this.isLoading = true;
    this.api.updateService(serviceForm.value, this.id).subscribe(res => {
      this.toast.success("Cập nhật thành công!");
      this.getAll();
      this.resetForm();
      document.querySelector('[data-bs-dismiss="modal"]')?.dispatchEvent(new Event('click'));
      this.isLoading = false;
    }, err => {
      this.toast.error("Lỗi: " + err);
      this.isLoading = false;
    })
  }

  confirmDelete(id: number) {
    this.deleteId = id;
    const modal = new bootstrap.Modal(document.getElementById('delete-confirmation-modal'));
    modal.show();
  }

  deleteService() {
    if (!this.deleteId) return;
    
    this.isLoading = true;
    this.api.deleteService(this.deleteId).subscribe(res => {
      this.toast.success("Xóa dịch vụ thành công!");
      this.getAll();
      this.deleteId = null;
      this.isLoading = false;
    }, err => {
      this.toast.error("Lỗi: " + err);
      this.isLoading = false;
    })
  }

  // Form operations
  editService(service: ServiceAttach) {
    this.id = service.id;
    this.serviceForm.patchValue({
      name: service.name,
      icon: service.icon,
      description: service.description
    });
  }

  resetForm() {
    this.serviceForm.reset();
    this.id = 0;
  }

  // Filtering and pagination
  toggleFilterSection() {
    this.showFilters = !this.showFilters;
  }

  clearFilters() {
    this.searchService = '';
    this.statusFilter = 'all';
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.serviceCache];
    
    // Filter by search text
    if (this.searchService.trim()) {
      const searchTerm = this.searchService.toLowerCase();
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(searchTerm) || 
        service.description?.toLowerCase().includes(searchTerm) ||
        service.icon?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filter by status - since we don't have isActive/isFeatured properties
    // For now, we'll keep all services in all status filters
    // In a real implementation, you might want to add these properties to your model
    // or use other properties to determine active/featured status
    
    // Set filtered data
    this.filteredServices = [...filtered];
    this.totalPages = Math.ceil(this.filteredServices.length / this.pageSize);
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
    }
    
    this.filteredServices = sorted;
  }

  // Export data
  exportData() {
    const data = this.serviceCache.map(service => {
      return {
        'ID': service.id,
        'Tên dịch vụ': service.name,
        'Icon': service.icon,
        'Mô tả': service.description,
        'Trạng thái': 'Hoạt động' // Default status since we don't have isActive property
      };
    });
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dịch vụ phòng');
    
    // Export to Excel
    XLSX.writeFile(workbook, 'danh-sach-dich-vu.xlsx');
  }

  // Dashboard metrics
  countActiveServices(): number {
    // Since we don't have isActive property, we'll count all services as active for now
    return this.roomType?.length || 0;
  }
  
  getFeaturedServicesCount(): number {
    // Since we don't have isFeatured property, we'll return a smaller number of services 
    // to simulate featured services
    return Math.floor((this.roomType?.length || 0) / 3); // Just an example, returning about 1/3 of services
  }
}
