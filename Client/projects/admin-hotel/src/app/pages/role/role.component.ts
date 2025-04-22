import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../_service/api.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Roles } from '../../models/roles.model';
import { environment } from '../../environments/environment.development';
import { RoleService } from '../../_service/role.service';
import * as XLSX from 'xlsx';
declare var bootstrap: any;

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent implements OnInit {
    // Data
    id!: number;
    roles!: Roles[];
    rolesResult!: Roles[];
    filteredRoles: Roles[] = [];
    rolesCache: Roles[] = [];
    deleteId: number | null = null;

    // Form
    roleForm!: FormGroup;
    
    // Search and filters
    searchTerm: string = '';
    statusFilter: string = 'all';
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
        private toast: ToastrService,
        private roleService: RoleService
    ) {
        this.initRoleForm();
    }
    
    ngOnInit(): void {
        this.isLoading = true;
        this.getAllRoles();
    }

    initRoleForm() {
        this.roleForm = this.fb.group({
            name: ['', Validators.required],
            normalizedName: ['', Validators.required],
            concurrencyStamp: ['']
        });
    }

    getAllRoles() {
        return this.roleService.getAllRoles().subscribe(res => {
            this.roles = res;
            this.rolesResult = res;
            this.rolesCache = [...res];
            this.applyFilters();
            this.isLoading = false;
        }, error => {
            this.toast.error('Lỗi khi tải dữ liệu: ' + error.message);
            this.isLoading = false;
        });
    }

    searchRoles() {
        if (!this.searchTerm.trim()) {
            this.getAllRoles();
            return;
        }
        
        const searchTerm = this.searchTerm.toLowerCase();
        this.filteredRoles = this.rolesCache.filter(item =>
            item.name.toLowerCase().includes(searchTerm) || 
            item.normalizedName.toLowerCase().includes(searchTerm)
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

    createRole(roleForm: FormGroup) {
        if (roleForm.invalid) {
            Object.keys(roleForm.controls).forEach(key => {
                roleForm.controls[key].markAsTouched();
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
        
        // Automatically create normalized name if not provided
        if (!roleForm.value.normalizedName || roleForm.value.normalizedName.trim() === '') {
            roleForm.patchValue({
                normalizedName: roleForm.value.name.toUpperCase()
            });
        }
        
        this.http
            .post<any>(
                environment.BASE_URL_API + "/v2/admin/roles/create",
                roleForm.value,
                httpOptions
            )
            .subscribe(
                (response) => {
                    this.toast.success("Thêm vai trò thành công!");
                    this.getAllRoles();
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

    fetchModal(role?: Roles) {
        if (role) {
            this.roleForm.patchValue({
                name: role.name,
                normalizedName: role.normalizedName,
                concurrencyStamp: role.concurrencyStamp
            });
        }
    }
    
    updateRole(roleForm: FormGroup) {
        if (roleForm.invalid) {
            Object.keys(roleForm.controls).forEach(key => {
                roleForm.controls[key].markAsTouched();
            });
            this.toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        this.isLoading = true;
        this.roleService.updateRole(roleForm.value, this.id).subscribe((res: Roles) => {
            this.toast.success("Cập nhật thành công!");
            this.getAllRoles();
            this.resetForm();
            document.querySelector('[data-bs-dismiss="modal"]')?.dispatchEvent(new Event('click'));
            this.isLoading = false;
        }, (err: Error) => {
            this.toast.error("Lỗi: " + err.message);
            this.isLoading = false;
        });
    }

    confirmDelete(id: number) {
        this.deleteId = id;
        const modal = new bootstrap.Modal(document.getElementById('delete-confirmation-modal'));
        modal.show();
    }

    deleteRole() {
        if (!this.deleteId) return;
        
        this.isLoading = true;
        this.roleService.deleteRole(this.deleteId).subscribe((res: any) => {
            this.toast.success("Xóa vai trò thành công!");
            this.getAllRoles();
            this.deleteId = null;
            this.isLoading = false;
        }, (err: Error) => {
            this.toast.error("Lỗi: " + err.message);
            this.isLoading = false;
        });
    }

    editRole(role: Roles) {
        this.id = +role.id;
        this.fetchModal(role);
    }

    resetForm() {
        this.roleForm.reset();
        this.id = 0;
    }

    // Filtering and pagination
    toggleFilterSection() {
        this.showFilters = !this.showFilters;
    }

    clearFilters() {
        this.searchTerm = '';
        this.statusFilter = 'all';
        this.applyFilters();
    }

    applyFilters() {
        let filtered = [...this.rolesCache];
        
        // Filter by search text
        if (this.searchTerm.trim()) {
            const searchTerm = this.searchTerm.toLowerCase();
            filtered = filtered.filter(role => 
                role.name.toLowerCase().includes(searchTerm) ||
                role.normalizedName.toLowerCase().includes(searchTerm)
            );
        }
        
        // Set filtered data
        this.filteredRoles = [...filtered];
        this.calculateTotalPages();
        this.currentPage = 1;
        this.applyPagination();
    }

    // Pagination
    applyPagination() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        
        if (this.viewMode === 'table') {
            this.filteredRoles = this.filteredRoles.slice(startIndex, endIndex);
        }
    }

    calculateTotalPages() {
        this.totalPages = Math.ceil(this.filteredRoles.length / this.pageSize);
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
        let sorted = [...this.filteredRoles];
        
        switch (criteria) {
            case 'nameAsc':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'nameDesc':
                sorted.sort((a, b) => b.name.localeCompare(a.name));
                break;
        }
        
        this.filteredRoles = sorted;
    }

    // Export data
    exportData() {
        const data = this.rolesCache.map(role => {
            return {
                'ID': role.id,
                'Tên vai trò': role.name,
                'Tên chuẩn hóa': role.normalizedName
            };
        });
        
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Vai trò');
        
        // Export to Excel
        XLSX.writeFile(workbook, 'danh-sach-vai-tro.xlsx');
    }

    // Dashboard metrics
    getTotalRoles(): number {
        return this.roles?.length || 0;
    }
    
    getSystemRolesCount(): number {
        return this.rolesCache.filter(role => 
            role.name.startsWith('Admin') || 
            role.name === 'SuperAdmin' || 
            role.name === 'System'
        ).length;
    }
    
    getUserRolesCount(): number {
        return this.rolesCache.filter(role => 
            !role.name.startsWith('Admin') && 
            role.name !== 'SuperAdmin' && 
            role.name !== 'System'
        ).length;
    }
}
