import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../_service/api.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Staff } from '../../models/staff.model';
import { environment } from '../../environments/environment.development';
import * as XLSX from 'xlsx';
declare var bootstrap: any;

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit {
  // Data
  imagePreviewUrl!: string | ArrayBuffer | null;
  picture!: any;
  id!: string;
  employees!: Staff[];
  employeeResult!: Staff[];
  filteredEmployees: Staff[] = [];
  employeeCache: Staff[] = [];
  deleteId: string | null = null;

  // Form
  employeeForm!: FormGroup;
  
  // Search and filters
  searchTerm: string = '';
  statusFilter: string = 'all';
  departmentFilter: string = 'all';
  showFilters: boolean = false;

  // View settings
  viewMode: 'card' | 'table' = 'card';
  
  // Pagination
  pageSize: number = 10;
  currentPage: number = 1;
  totalPages: number = 1;
  
  // Loading state
  isLoading: boolean = false;
  isEditMode: boolean = false;

  // Department options
  departments: string[] = ['Reception', 'Housekeeping', 'Management', 'Food Service', 'Maintenance'];

  constructor(
      private api: ApiService, 
      private http: HttpClient, 
      private fb: FormBuilder, 
      private toast: ToastrService
  ) {
      this.initEmployeeForm();
  }
  
  ngOnInit(): void {
      this.isLoading = true;
      this.getAll();
  }

  initEmployeeForm() {
      this.employeeForm = this.fb.group({
          name: ['', Validators.required],
          email: ['', [Validators.required, Validators.email]],
          phoneNumber: ['', [Validators.required, Validators.pattern("^[0-9]{10,11}$")]],
          address: [''],
          department: ['', Validators.required],
          position: ['', Validators.required],
          salary: ['', [Validators.required, Validators.min(0)]],
          status: [true],
          image: ['']
      });
  }

  getAll() {
      return this.api.getallEmployee().subscribe(res => {
          this.employees = res;
          this.employeeResult = res;
          this.employeeCache = [...res];
          this.applyFilters();
          this.isLoading = false;
      }, error => {
          this.toast.error('Lỗi khi tải dữ liệu: ' + error.message);
          this.isLoading = false;
      });
  }

  searchEmployees() {
      if (!this.searchTerm.trim()) {
          this.getAll();
          return;
      }
      
      const searchTerm = this.searchTerm.toLowerCase();
      this.filteredEmployees = this.employeeCache.filter(item =>
          item.name.toLowerCase().includes(searchTerm) ||
          item.email.toLowerCase().includes(searchTerm) ||
          (item.phoneNumber && item.phoneNumber.toString().includes(searchTerm))
      );
      
      this.calculateTotalPages();
      this.currentPage = 1;
      this.applyPagination();
  }

  clearSearch() {
      this.searchTerm = '';
      this.applyFilters();
  }

  toggleSelection(id: string) {
      this.id = id;
  }

  createEmployee(employeeForm: FormGroup) {
      if (employeeForm.invalid) {
          Object.keys(employeeForm.controls).forEach(key => {
              employeeForm.controls[key].markAsTouched();
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
          name: employeeForm.controls['name'].value,
          email: employeeForm.controls['email'].value,
          phoneNumber: employeeForm.controls['phoneNumber'].value,
          address: employeeForm.controls['address'].value,
          department: employeeForm.controls['department'].value,
          position: employeeForm.controls['position'].value,
          salary: employeeForm.controls['salary'].value,
          status: employeeForm.controls['status'].value,
          image: employeeForm.controls['image'].value
      };
      
      this.http
          .post<any>(
              environment.BASE_URL_API + "/v2/admin/employee/create",
              requestData,
              httpOptions
          )
          .subscribe(
              (response) => {
                  this.toast.success("Thêm nhân viên thành công!");
                  this.getAll();
                  this.resetForm();
                  document.querySelector('[data-bs-dismiss="modal"]')?.dispatchEvent(new Event('click'));
                  this.isLoading = false;
              },
              (error) => {
                  this.toast.error("Lỗi: " + (error.error?.message || "Không thể thêm nhân viên"));
                  this.isLoading = false;
              }
          );
  }

  fetchModal(employee?: Staff) {
      if (employee) {
          this.isEditMode = true;
          this.employeeForm.patchValue({
              name: employee.name,
              email: employee.email,
              phoneNumber: employee.phoneNumber,
              address: employee.address || '',
              department: employee.department || '',
              position: employee.position || '',
              salary: employee.salary || 0,
              status: employee.emailConfirmed === 'true',
              image: employee.image
          });
          
          if (employee.image) {
              this.imagePreviewUrl = employee.image;
          } else {
              this.imagePreviewUrl = null;
          }
      } else {
          this.isEditMode = false;
          this.resetForm();
      }
  }
  
  updateEmployee(employeeForm: FormGroup) {
      if (employeeForm.invalid) {
          Object.keys(employeeForm.controls).forEach(key => {
              employeeForm.controls[key].markAsTouched();
          });
          this.toast.error('Vui lòng điền đầy đủ thông tin');
          return;
      }

      this.isLoading = true;
      
      const requestData = {
          id: this.id,
          name: employeeForm.controls['name'].value,
          email: employeeForm.controls['email'].value,
          phoneNumber: employeeForm.controls['phoneNumber'].value,
          address: employeeForm.controls['address'].value,
          department: employeeForm.controls['department'].value,
          position: employeeForm.controls['position'].value,
          salary: employeeForm.controls['salary'].value,
          status: employeeForm.controls['status'].value,
          image: employeeForm.controls['image'].value
      };
      
      this.api.updateEmployee(requestData, this.id).subscribe(res => {
          this.toast.success("Cập nhật thành công!");
          this.getAll();
          this.resetForm();
          document.querySelector('[data-bs-dismiss="modal"]')?.dispatchEvent(new Event('click'));
          this.isLoading = false;
      }, err => {
          this.toast.error("Lỗi: " + (err.error?.message || "Không thể cập nhật nhân viên"));
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
          const employeeImageControl = this.employeeForm.get('image');
          if (employeeImageControl) {
              employeeImageControl.updateValueAndValidity();
          }
      }
  };

  confirmDelete(id: string) {
      this.deleteId = id;
      const modal = new bootstrap.Modal(document.getElementById('delete-confirmation-modal'));
      modal.show();
  }

  deleteEmployee() {
      if (!this.deleteId) return;
      
      this.isLoading = true;
      this.api.deleteEmployee(this.deleteId).subscribe(res => {
          this.toast.success("Xóa nhân viên thành công!");
          this.getAll();
          this.deleteId = null;
          this.isLoading = false;
      }, err => {
          this.toast.error("Lỗi: " + (err.error?.message || "Không thể xóa nhân viên"));
          this.isLoading = false;
      });
  }

  editEmployee(employee: Staff) {
      this.id = employee.id;
      this.fetchModal(employee);
  }

  resetForm() {
      this.employeeForm.reset();
      this.id = '';
      this.imagePreviewUrl = null;
      this.isEditMode = false;
      this.employeeForm.patchValue({
          status: true
      });
  }

  // Filtering and pagination
  toggleFilterSection() {
      this.showFilters = !this.showFilters;
  }

  clearFilters() {
      this.searchTerm = '';
      this.statusFilter = 'all';
      this.departmentFilter = 'all';
      this.applyFilters();
  }

  applyFilters() {
      let filtered = [...this.employeeCache];
      
      // Filter by search text
      if (this.searchTerm.trim()) {
          const searchTerm = this.searchTerm.toLowerCase();
          filtered = filtered.filter(employee => 
              employee.name.toLowerCase().includes(searchTerm) ||
              employee.email.toLowerCase().includes(searchTerm) ||
              (employee.phoneNumber && employee.phoneNumber.toString().includes(searchTerm))
          );
      }
      
      // Filter by status
      if (this.statusFilter !== 'all') {
          const isActive = this.statusFilter === 'active';
          filtered = filtered.filter(employee => 
              employee.emailConfirmed === (isActive ? 'true' : 'false')
          );
      }
      
      // Filter by department
      if (this.departmentFilter !== 'all') {
          filtered = filtered.filter(employee => 
              employee.department === this.departmentFilter
          );
      }
      
      // Set filtered data
      this.filteredEmployees = [...filtered];
      this.calculateTotalPages();
      this.currentPage = 1;
      this.applyPagination();
  }

  // Pagination
  applyPagination() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      
      if (this.viewMode === 'table') {
          this.filteredEmployees = this.filteredEmployees.slice(startIndex, endIndex);
      }
  }

  calculateTotalPages() {
      this.totalPages = Math.ceil(this.filteredEmployees.length / this.pageSize);
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
      let sorted = [...this.filteredEmployees];
      
      switch (criteria) {
          case 'nameAsc':
              sorted.sort((a, b) => a.name.localeCompare(b.name));
              break;
          case 'nameDesc':
              sorted.sort((a, b) => b.name.localeCompare(a.name));
              break;
          case 'newest':
              sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              break;
          case 'oldest':
              sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
              break;
          case 'salaryAsc':
              sorted.sort((a, b) => (a.salary || 0) - (b.salary || 0));
              break;
          case 'salaryDesc':
              sorted.sort((a, b) => (b.salary || 0) - (a.salary || 0));
              break;
      }
      
      this.filteredEmployees = sorted;
  }

  // Export data
  exportData() {
      const data = this.employeeCache.map(employee => {
          return {
              'ID': employee.id,
              'Tên nhân viên': employee.name,
              'Email': employee.email,
              'Số điện thoại': employee.phoneNumber || '',
              'Địa chỉ': employee.address || '',
              'Phòng ban': employee.department || '',
              'Chức vụ': employee.position || '',
              'Lương': employee.salary || 0,
              'Trạng thái': employee.emailConfirmed === 'true' ? 'Hoạt động' : 'Không hoạt động',
              'Ngày tạo': employee.createdAt ? new Date(employee.createdAt).toLocaleDateString('vi-VN') : ''
          };
      });
      
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Nhân viên');
      
      // Export to Excel
      XLSX.writeFile(workbook, 'danh-sach-nhan-vien.xlsx');
  }

  // Dashboard metrics
  getTotalEmployees(): number {
      return this.employeeCache?.length || 0;
  }
  
  getActiveEmployeesCount(): number {
      return this.employeeCache?.filter(employee => employee.emailConfirmed === 'true').length || 0;
  }
  
  getInactiveEmployeesCount(): number {
      return this.employeeCache?.filter(employee => employee.emailConfirmed !== 'true').length || 0;
  }
  
  getTotalSalary(): number {
      if (!this.employeeCache || this.employeeCache.length === 0) return 0;
      
      return this.employeeCache.reduce((sum, employee) => {
          return sum + (employee.salary || 0);
      }, 0);
  }
  
  updateStatus(id: string, status: boolean) {
      this.isLoading = true;
      
      this.api.updateEmployeeStatus(id, status ? 'active' : 'inactive').subscribe(
          res => {
              this.toast.success(`Cập nhật trạng thái nhân viên thành công!`);
              this.getAll();
              this.isLoading = false;
          },
          err => {
              this.toast.error("Lỗi: " + (err.error?.message || "Không thể cập nhật trạng thái"));
              this.isLoading = false;
          }
      );
  }
}