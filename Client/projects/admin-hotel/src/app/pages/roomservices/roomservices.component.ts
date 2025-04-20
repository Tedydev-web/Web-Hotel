import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiceAttach } from '../../models/serviceAttach.model';
import { ApiService } from '../../_service/api.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { environment } from '../../environments/environment.development';

@Component({
  selector: 'app-roomservices',
  templateUrl: './roomservices.component.html',
  styleUrls: ['./roomservices.component.css']
})
export class RoomservicesComponent implements OnInit {
  // Service data
  roomServices: ServiceAttach[] = [];
  filteredServices: ServiceAttach[] = [];
  selectedService: ServiceAttach | null = null;
  
  // UI state
  isLoading: boolean = false;
  searchTerm: string = '';
  showFilters: boolean = false;
  viewMode: 'card' | 'table' = 'card';
  
  // Filters
  statusFilter: string = 'all';
  
  // Pagination
  pageSize: number = 10;
  currentPage: number = 1;
  totalPages: number = 1;
  
  // Forms
  serviceForm!: FormGroup;
  editServiceForm!: FormGroup;
  
  constructor(
    private api: ApiService, 
    private fb: FormBuilder, 
    private toast: ToastrService,
    private http: HttpClient
  ) {
    this.initForms();
  }
  
  ngOnInit(): void {
    this.getAllServices();
  }

  initForms() {
    this.serviceForm = this.fb.group({
      name: ['', [Validators.required]],
      icon: ['', [Validators.required]],
      description: ['', [Validators.required]]
    });

    this.editServiceForm = this.fb.group({
      name: ['', [Validators.required]],
      icon: ['', [Validators.required]],
      description: ['', [Validators.required]]
    });
  }

  getAllServices() {
    this.isLoading = true;
    this.api.getAllService().subscribe(
      (res) => {
        this.roomServices = res;
        this.filteredServices = res;
        this.totalPages = Math.ceil(this.filteredServices.length / this.pageSize);
        this.applyPagination();
        this.isLoading = false;
      },
      (err) => {
        this.toast.error('Không thể tải dữ liệu dịch vụ');
        console.error(err);
        this.isLoading = false;
      }
    );
  }
  
  createService() {
    if (this.serviceForm.invalid) {
      // Mark all fields as touched to display validation errors
      Object.keys(this.serviceForm.controls).forEach(key => {
        const control = this.serviceForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
      return;
    }
    
    this.isLoading = true;
    this.api.createService(this.serviceForm.value).subscribe(
      (res) => {
        this.toast.success('Thêm dịch vụ thành công!');
        this.getAllServices();
        this.serviceForm.reset();
        document.getElementById('service-modal-close')?.click();
        this.isLoading = false;
      },
      (err) => {
        this.toast.error('Lỗi khi thêm dịch vụ');
        console.error(err);
        this.isLoading = false;
      }
    );
  }
  
  getServiceById(id: number) {
    this.isLoading = true;
    this.api.getServiceById(id).subscribe(
      (res: ServiceAttach) => {
        this.selectedService = res;
        this.editServiceForm.patchValue({
          name: res.name,
          icon: res.icon,
          description: res.description
        });
        this.isLoading = false;
      },
      (err: any) => {
        this.toast.error('Không thể tải chi tiết dịch vụ');
        console.error(err);
        this.isLoading = false;
      }
    );
  }
  
  updateService() {
    if (this.editServiceForm.invalid || !this.selectedService) {
      return;
    }
    
    this.isLoading = true;
    this.api.updateService(this.editServiceForm.value, this.selectedService.id).subscribe(
      (res) => {
        this.toast.success('Cập nhật dịch vụ thành công!');
        this.getAllServices();
        document.getElementById('edit-modal-close')?.click();
        this.isLoading = false;
      },
      (err) => {
        this.toast.error('Lỗi khi cập nhật dịch vụ');
        console.error(err);
        this.isLoading = false;
      }
    );
  }
  
  deleteService(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa dịch vụ này không?')) {
      this.isLoading = true;
      this.api.deleteService(id).subscribe(
        (res) => {
          this.toast.success('Xóa dịch vụ thành công!');
          this.getAllServices();
          this.isLoading = false;
        },
        (err) => {
          this.toast.error('Lỗi khi xóa dịch vụ');
          console.error(err);
          this.isLoading = false;
        }
      );
    }
  }
  
  // Search and filters
  searchServices() {
    if (!this.searchTerm.trim()) {
      this.filteredServices = [...this.roomServices];
      return;
    }
    
    const searchTermLower = this.searchTerm.toLowerCase();
    
    this.filteredServices = this.roomServices.filter((service) =>
      service.name.toLowerCase().includes(searchTermLower) ||
      service.description.toLowerCase().includes(searchTermLower)
    );
    
    this.totalPages = Math.ceil(this.filteredServices.length / this.pageSize);
    this.currentPage = 1;
    this.applyPagination();
  }
  
  clearSearch() {
    this.searchTerm = '';
    this.filteredServices = [...this.roomServices];
    this.totalPages = Math.ceil(this.filteredServices.length / this.pageSize);
    this.currentPage = 1;
    this.applyPagination();
  }
  
  toggleFilterSection() {
    this.showFilters = !this.showFilters;
  }
  
  clearFilters() {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.filteredServices = [...this.roomServices];
    this.totalPages = Math.ceil(this.filteredServices.length / this.pageSize);
    this.currentPage = 1;
    this.applyPagination();
  }
  
  applyFilters() {
    let filtered = [...this.roomServices];
    
    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchTermLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter((service) =>
        service.name.toLowerCase().includes(searchTermLower) ||
        service.description.toLowerCase().includes(searchTermLower)
      );
    }
    
    // Apply status filter if implemented in the future
    // This is a placeholder for potential future filter by status
    
    this.filteredServices = filtered;
    this.totalPages = Math.ceil(this.filteredServices.length / this.pageSize);
    this.currentPage = 1;
    this.applyPagination();
  }
  
  // Pagination
  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.applyPagination();
  }
  
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const totalPages = Math.ceil(this.filteredServices.length / this.pageSize);
    
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (this.currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
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
  
  applyPagination() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredServices = this.roomServices.slice(0, this.roomServices.length);
    // For immediate display update
    this.filteredServices = this.filteredServices.slice(startIndex, endIndex);
  }
  
  // View mode
  setViewMode(mode: 'card' | 'table') {
    this.viewMode = mode;
  }
  
  // Sort function
  sortBy(criteria: string) {
    let sorted = [...this.filteredServices];
    
    switch (criteria) {
      case 'nameAsc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'nameDesc':
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
        // If your service has creation date
        // sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        // If your service has creation date
        // sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
    }
    
    this.filteredServices = sorted;
  }
  
  // Export to Excel
  exportToExcel() {
    const data = this.roomServices.map(service => {
      return {
        'Tên dịch vụ': service.name,
        'Biểu tượng': service.icon,
        'Mô tả': service.description
      };
    });
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dịch vụ phòng');
    
    // Export Excel file
    XLSX.writeFile(workbook, 'danh-sach-dich-vu-phong.xlsx');
  }
  
  // Analytics and metrics
  getTotalServices(): number {
    return this.roomServices.length;
  }
  
  // This would require additional implementation in your API
  getActiveServices(): number {
    // Replace with actual implementation if you have active/inactive status
    return this.roomServices.length;
  }
}
