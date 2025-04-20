import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../_service/api.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Salary } from '../../models/salary';
import { environment } from '../../environments/environment.development';
import * as XLSX from 'xlsx';
import { Staff } from '../../models/staff.model';
declare var bootstrap: any;

@Component({
  selector: 'app-salary',
  templateUrl: './salary.component.html',
  styleUrls: ['./salary.component.css']
})
export class SalaryComponent implements OnInit {
  // Data
  salaryGetAll: Salary[] = [];
  filteredSalaries: Salary[] = [];
  salaryCache: Salary[] = [];
  deleteId: number | null = null;
  selectedSalary: Salary | null = null;
  employees: Staff[] = [];

  // Form
  salaryForm!: FormGroup;
  
  // Search and filters
  searchTerm: string = '';
  statusFilter: string = 'all';
  dateFilter: string = 'all';
  showFilters: boolean = false;

  // View settings
  viewMode: 'card' | 'table' = 'card';
  
  // Pagination
  pageSize: number = 10;
  currentPage: number = 1;
  totalPages: number = 1;
  
  // Tab selection
  activeTab: 'day' | 'month' | 'year' = 'day';
  
  // Loading state
  isLoading: boolean = false;
  noDataFound: boolean = false;

  constructor(
      private api: ApiService, 
      private http: HttpClient, 
      private fb: FormBuilder, 
      private toast: ToastrService
  ) {
      this.initSalaryForm();
  }
  
  ngOnInit(): void {
      this.isLoading = true;
      this.loadEmployees();
  }

  initSalaryForm() {
      this.salaryForm = this.fb.group({
          employeeName: ['', Validators.required],
          employeeId: ['', Validators.required],
          position: ['', Validators.required],
          basicSalary: ['', [Validators.required, Validators.min(0)]],
          bonusSalary: ['', [Validators.min(0)]],
          workDays: ['', [Validators.required, Validators.min(0), Validators.max(31)]],
          workTime: [new Date(), Validators.required]
      });
  }

  // Tải danh sách nhân viên 
  loadEmployees() {
      this.isLoading = true;
      this.api.getallEmployee().subscribe(res => {
          this.employees = res;
          this.getAll();
      }, error => {
          this.toast.error('Lỗi khi tải dữ liệu nhân viên: ' + error.message);
          this.isLoading = false;
          this.noDataFound = true;
      });
  }

  getAll() {
      this.isLoading = true;
      
      // Gọi API để lấy dữ liệu lương thực
      this.http.get<Salary[]>(environment.BASE_URL_API + "/v2/admin/salary/get-all").subscribe(
          (res) => {
              if (res && res.length > 0) {
                  this.salaryGetAll = res;
                  this.salaryCache = [...res];
                  this.noDataFound = false;
              } else {
                  this.salaryGetAll = [];
                  this.salaryCache = [];
                  this.noDataFound = true;
              }
              this.applyFilters();
              this.isLoading = false;
          },
          (error) => {
              this.toast.error('Lỗi khi tải dữ liệu lương: ' + error.message);
              this.salaryGetAll = [];
              this.salaryCache = [];
              this.noDataFound = true;
              this.isLoading = false;
          }
      );
  }
  
  // ... các phương thức tìm kiếm và lọc dữ liệu ...

  fetchEmployeeName(employeeId: string): Staff | null {
      if (!this.employees || !employeeId) return null;
      return this.employees.find(e => e.id === employeeId) || null;
  }
  
  createSalary(salaryForm: FormGroup) {
      if (salaryForm.invalid) {
          Object.keys(salaryForm.controls).forEach(key => {
              salaryForm.controls[key].markAsTouched();
          });
          this.toast.error('Vui lòng điền đầy đủ thông tin');
          return;
      }

      this.isLoading = true;
      
      // Kiểm tra nếu nhân viên tồn tại
      const employeeId = salaryForm.value.employeeId;
      const employee = this.fetchEmployeeName(employeeId);
      
      if (!employee && !this.employees.some(e => e.id === employeeId)) {
          this.toast.warning("ID nhân viên không tồn tại trong hệ thống.");
          this.isLoading = false;
          return;
      }
      
      // Gọi API để tạo bản ghi lương thực
      const httpOptions = {
          headers: new HttpHeaders({
              'Content-Type': 'application/json'
          })
      };
      
      this.http
          .post<any>(
              environment.BASE_URL_API + "/v2/admin/salary/create",
              salaryForm.value,
              httpOptions
          )
          .subscribe(
              (response) => {
                  this.toast.success("Thêm bản ghi lương thành công!");
                  this.getAll();
                  this.resetForm();
                  document.querySelector('[data-bs-dismiss="modal"]')?.dispatchEvent(new Event('click'));
              },
              (error) => {
                  this.toast.error("Lỗi: " + (error.error?.message || error.message || 'Đã xảy ra lỗi khi thêm bản ghi lương'));
                  this.isLoading = false;
              }
          );
  }

  fetchModal(salary: Salary) {
      if (salary) {
          this.salaryForm.patchValue({
              employeeName: salary.employeeName,
              employeeId: salary.employeeId,
              position: salary.position,
              basicSalary: salary.basicSalary,
              bonusSalary: salary.bonusSalary || 0,
              workDays: salary.workDays,
              workTime: new Date(salary.workTime)
          });
      }
  }
  
  updateSalary(salaryForm: FormGroup) {
      if (salaryForm.invalid) {
          Object.keys(salaryForm.controls).forEach(key => {
              salaryForm.controls[key].markAsTouched();
          });
          this.toast.error('Vui lòng điền đầy đủ thông tin');
          return;
      }

      this.isLoading = true;
      
      if (!this.selectedSalary) {
          this.toast.error('Không tìm thấy bản ghi lương để cập nhật');
          this.isLoading = false;
          return;
      }
      
      // Gọi API để cập nhật bản ghi lương thực
      const salaryId = this.selectedSalary?.id ? +this.selectedSalary.id : undefined;
      if (!salaryId) {
          this.toast.error('ID lương không hợp lệ');
          this.isLoading = false;
          return;
      }
      
      this.http
          .post<any>(
              environment.BASE_URL_API + `/v2/admin/salary/update?id=${salaryId}`,
              salaryForm.value
          )
          .subscribe(
              (response) => {
                  this.toast.success("Cập nhật thành công!");
                  this.getAll();
                  this.resetForm();
                  document.querySelector('[data-bs-dismiss="modal"]')?.dispatchEvent(new Event('click'));
              },
              (error) => {
                  this.toast.error("Lỗi: " + (error.error?.message || error.message || 'Đã xảy ra lỗi khi cập nhật bản ghi lương'));
                  this.isLoading = false;
              }
          );
  }

  confirmDelete(id: number) {
      this.deleteId = id;
      const modal = new bootstrap.Modal(document.getElementById('delete-confirmation-modal'));
      modal.show();
  }

  deleteSalary() {
      if (!this.deleteId) return;
      
      this.isLoading = true;
      
      // Gọi API để xóa bản ghi lương thực
      this.http
          .get<any>(environment.BASE_URL_API + `/v2/admin/salary/delete?id=${this.deleteId}`)
          .subscribe(
              (response) => {
                  this.toast.success("Xóa bản ghi lương thành công!");
                  this.getAll();
                  this.deleteId = null;
              },
              (error) => {
                  this.toast.error("Lỗi: " + (error.error?.message || error.message || 'Đã xảy ra lỗi khi xóa bản ghi lương'));
                  this.isLoading = false;
              }
          );
  }

  editSalary(salary: Salary) {
      this.selectedSalary = salary;
      this.fetchModal(salary);
  }

  resetForm() {
      this.salaryForm.reset();
      this.selectedSalary = null;
      // Đặt giá trị mặc định cho trường workTime
      this.salaryForm.patchValue({
          workTime: new Date()
      });
  }

  // ... phương thức lọc và phân trang ...
  // Giữ nguyên các phương thức còn lại như cũ
  
  searchSalaries() {
      if (!this.searchTerm.trim()) {
          this.filteredSalaries = [...this.salaryCache];
          this.calculateTotalPages();
          this.currentPage = 1;
          this.applyPagination();
          return;
      }
      
      const searchTerm = this.searchTerm.toLowerCase();
      this.filteredSalaries = this.salaryCache.filter(item =>
          item.employeeName?.toLowerCase().includes(searchTerm) ||
          item.employeeId?.toLowerCase().includes(searchTerm) ||
          item.position?.toLowerCase().includes(searchTerm)
      );
      
      this.calculateTotalPages();
      this.currentPage = 1;
      this.applyPagination();
  }

  clearSearch() {
      this.searchTerm = '';
      this.filteredSalaries = [...this.salaryCache];
      this.calculateTotalPages();
      this.currentPage = 1;
      this.applyPagination();
  }

  setSelectedSalary(salary: Salary) {
      this.selectedSalary = salary;
  }
  
  toggleFilterSection() {
      this.showFilters = !this.showFilters;
  }

  clearFilters() {
      this.searchTerm = '';
      this.statusFilter = 'all';
      this.dateFilter = 'all';
      this.applyFilters();
  }

  applyFilters() {
      let filtered = [...this.salaryCache];
      
      // Filter by search text
      if (this.searchTerm.trim()) {
          const searchTerm = this.searchTerm.toLowerCase();
          filtered = filtered.filter(salary => 
              salary.employeeName?.toLowerCase().includes(searchTerm) ||
              salary.employeeId?.toLowerCase().includes(searchTerm) ||
              salary.position?.toLowerCase().includes(searchTerm)
          );
      }
      
      // Filter by date period
      if (this.dateFilter !== 'all') {
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();
          
          switch(this.dateFilter) {
              case 'current-month':
                  filtered = filtered.filter(salary => {
                      const salaryDate = new Date(salary.workTime);
                      return salaryDate.getMonth() === currentMonth && salaryDate.getFullYear() === currentYear;
                  });
                  break;
              case 'previous-month':
                  filtered = filtered.filter(salary => {
                      const salaryDate = new Date(salary.workTime);
                      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
                      const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
                      return salaryDate.getMonth() === prevMonth && salaryDate.getFullYear() === prevMonthYear;
                  });
                  break;
              case 'current-year':
                  filtered = filtered.filter(salary => {
                      const salaryDate = new Date(salary.workTime);
                      return salaryDate.getFullYear() === currentYear;
                  });
                  break;
          }
      }
      
      // Set filtered data
      this.filteredSalaries = [...filtered];
      this.calculateTotalPages();
      this.currentPage = 1;
      this.applyPagination();
  }

  // Pagination
  applyPagination() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      
      if (this.viewMode === 'table') {
          this.filteredSalaries = this.filteredSalaries.slice(startIndex, endIndex);
      }
  }

  calculateTotalPages() {
      this.totalPages = Math.ceil(this.filteredSalaries.length / this.pageSize);
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
      let sorted = [...this.filteredSalaries];
      
      switch (criteria) {
          case 'nameAsc':
              sorted.sort((a, b) => (a.employeeName || '').localeCompare(b.employeeName || ''));
              break;
          case 'nameDesc':
              sorted.sort((a, b) => (b.employeeName || '').localeCompare(a.employeeName || ''));
              break;
          case 'salaryAsc':
              sorted.sort((a, b) => (a.basicSalary || 0) - (b.basicSalary || 0));
              break;
          case 'salaryDesc':
              sorted.sort((a, b) => (b.basicSalary || 0) - (a.basicSalary || 0));
              break;
          case 'dateAsc':
              sorted.sort((a, b) => new Date(a.workTime).getTime() - new Date(b.workTime).getTime());
              break;
          case 'dateDesc':
              sorted.sort((a, b) => new Date(b.workTime).getTime() - new Date(a.workTime).getTime());
              break;
      }
      
      this.filteredSalaries = sorted;
  }

  // Tab management
  setActiveTab(tab: 'day' | 'month' | 'year') {
      this.activeTab = tab;
      // Additional logic based on tab can be added here
  }

  // Export data
  exportData() {
      const data = this.salaryCache.map(salary => {
          return {
              'ID': salary.id,
              'Tên nhân viên': salary.employeeName,
              'Mã nhân viên': salary.employeeId,
              'Chức vụ': salary.position,
              'Lương cơ bản': salary.basicSalary,
              'Thưởng': salary.bonusSalary || 0,
              'Ngày công': salary.workDays,
              'Tổng lương': this.calculateTotalSalary(salary),
              'Thời gian': new Date(salary.workTime).toLocaleDateString('vi-VN')
          };
      });
      
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Bảng lương');
      
      // Export to Excel
      XLSX.writeFile(workbook, 'bang-luong.xlsx');
  }

  // Dashboard metrics
  getTotalEmployees(): number {
      return this.getUniqueEmployeeCount();
  }
  
  getUniqueEmployeeCount(): number {
      if (!this.salaryCache || this.salaryCache.length === 0) return 0;
      
      const uniqueEmployees = new Set();
      this.salaryCache.forEach(salary => {
          if (salary.employeeId) {
              uniqueEmployees.add(salary.employeeId);
          }
      });
      
      return uniqueEmployees.size;
  }
  
  getTotalSalaryAmount(): number {
      if (!this.salaryCache || this.salaryCache.length === 0) return 0;
      
      return this.salaryCache.reduce((sum, salary) => {
          return sum + this.calculateTotalSalary(salary);
      }, 0);
  }

  getAverageSalary(): number {
      if (!this.salaryCache || this.salaryCache.length === 0) return 0;
      
      const totalSalary = this.getTotalSalaryAmount();
      const uniqueEmployeeCount = this.getUniqueEmployeeCount();
      
      return uniqueEmployeeCount > 0 ? totalSalary / uniqueEmployeeCount : 0;
  }
  
  calculateTotalSalary(salary: Salary): number {
      const basicSalary = salary.basicSalary || 0;
      const bonusSalary = salary.bonusSalary || 0;
      const workDays = salary.workDays || 0;
      
      // Assuming basic salary is for 30 days and we prorate based on work days
      const proRatedSalary = (basicSalary / 30) * workDays;
      
      return proRatedSalary + bonusSalary;
  }
}
