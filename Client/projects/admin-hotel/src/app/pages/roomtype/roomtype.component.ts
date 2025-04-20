import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../_service/api.service';
import { roomType } from '../../models/room.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';

interface RoomType {
  id: number;
  typeName: string;
}

@Component({
  selector: 'app-roomtype',
  templateUrl: './roomtype.component.html',
  styleUrls: ['./roomtype.component.css']
})

export class RoomtypeComponent implements OnInit{
  id!: number;
  roomType!: roomType[];
  roomTypes!: any[];
  nameRoomType!: string;
  nameTypeForm!: FormGroup;
  roomTypeId!: string;
  selectedIds: string[] = [];
  searchRoomType: string = '';
  
  // Các thuộc tính mới cho giao diện
  filteredRoomTypes: any[] = [];
  viewMode: 'card' | 'table' = 'table';
  showFilters: boolean = false;
  sortOption: string = 'nameAsc';
  currentPage: number = 1;
  totalPages: number = 1;
  pageSize: number = 10;
  isLoading: boolean = false;
  roomCounts: {[key: number]: number} = {};

  constructor(private api: ApiService, private fb: FormBuilder, private toast: ToastrService){
    this.nameTypeForm = this.fb.group({
      TypeName : ['']
    });
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.api.getAllRoomType().subscribe(res => {
      this.roomType = res;
      this.roomTypes = res;
      this.applyFilters();
      this.loadRoomCounts();
      this.isLoading = false;
    });
  }

  getAll(){
    this.isLoading = true;
    this.api.getAllRoomType().subscribe(res => {
      this.roomType = res;
      this.roomTypes = res;
      this.applyFilters();
      this.isLoading = false;
    });
  }

  searchBookings() {
    // Chuyển đổi từ khóa tìm kiếm thành chữ thường
    const searchTerm = this.searchRoomType.toLowerCase();
    // Lọc các đặt phòng dựa trên từ khóa tìm kiếm
    this.roomType = this.roomTypes.filter((item) =>
      item.typeName.toLowerCase().includes(searchTerm) ||
      item.id.toString().includes(searchTerm)
    );
    this.searchRoomType = '';
  }

  clearSearch() {
    this.roomType = this.roomTypes;
  }
 
  createRoomType(nameTypeForm: FormGroup){
    this.isLoading = true;
    return this.api.createRoomType(nameTypeForm.value).subscribe(res => {
      this.toast.success("Thêm loại phòng thành công!");
      this.getAll();
      this.isLoading = false;
    }, err => {
      this.toast.error(err);
      this.isLoading = false;
    });
  }

  fetchModal(){
    this.nameTypeForm = this.fb.group({
      TypeName : [this.nameRoomType]
    });
  }

  update(nameTypeForm: FormGroup){
    this.isLoading = true;
    this.api.updateRoomTypeName(this.roomTypeId, nameTypeForm.value)
      .subscribe(
        () => {
          this.toast.success("Cập nhật thành công!");
          this.getAll();
          this.isLoading = false;
        },
        error => {
          this.toast.error('Đã xảy ra lỗi:', error);
          this.isLoading = false;
        }
      );
  }

  toggleSelection(itemId: string, nametypeRoom: string) {
    this.roomTypeId = itemId;
    this.nameRoomType = nametypeRoom;
    this.fetchModal();
  }

  deleteType(id: number){
    if (confirm('Bạn có chắc chắn muốn xóa loại phòng này?')) {
      this.isLoading = true;
      this.api.deleteRoomType(id).subscribe(res => {
        this.toast.success("Xóa loại phòng thành công!");
        this.getAll();
        this.isLoading = false;
      }, err => {
        this.toast.error(err);
        this.isLoading = false;
      });
    }
  }

  // Các phương thức mới cho UI

  getMostPopularType(): any {
    // Giả sử loại phòng phổ biến nhất là loại có nhiều phòng nhất
    if (!this.roomType || this.roomType.length === 0 || !this.roomCounts) return null;
    
    let maxCount = 0;
    let popularType = null;
    
    for (const type of this.roomType) {
      const count = this.roomCounts[type.id] || 0;
      if (count > maxCount) {
        maxCount = count;
        popularType = type;
      }
    }
    
    return popularType;
  }

  getLastUpdatedDate(): string {
    // Giả sử ngày cập nhật cuối là thời gian hiện tại
    const today = new Date();
    return today.toLocaleDateString('vi-VN');
  }

  loadRoomCounts(): void {
    // Gọi API để lấy số lượng phòng cho mỗi loại phòng
    // Giả sử mỗi loại phòng có 1-10 phòng
    this.roomType.forEach(type => {
      this.roomCounts[type.id] = Math.floor(Math.random() * 10) + 1;
    });
  }

  getRoomCountByType(typeId: number): number {
    return this.roomCounts[typeId] || 0;
  }

  toggleFilterSection(): void {
    this.showFilters = !this.showFilters;
  }

  clearFilters(): void {
    this.searchRoomType = '';
    this.sortOption = 'nameAsc';
    this.applyFilters();
  }

  applyFilters(): void {
    this.isLoading = true;
    let filtered = [...this.roomTypes];
    
    // Lọc theo từ khóa tìm kiếm
    if (this.searchRoomType.trim()) {
      const searchTerm = this.searchRoomType.toLowerCase();
      filtered = filtered.filter(type => 
        type.typeName.toLowerCase().includes(searchTerm) || 
        type.id.toString().includes(searchTerm)
      );
    }
    
    // Sắp xếp theo lựa chọn
    switch (this.sortOption) {
      case 'nameAsc':
        filtered.sort((a, b) => a.typeName.localeCompare(b.typeName));
        break;
      case 'nameDesc':
        filtered.sort((a, b) => b.typeName.localeCompare(a.typeName));
        break;
      case 'idAsc':
        filtered.sort((a, b) => a.id - b.id);
        break;
      case 'idDesc':
        filtered.sort((a, b) => b.id - a.id);
        break;
    }
    
    this.filteredRoomTypes = filtered;
    this.totalPages = Math.ceil(this.filteredRoomTypes.length / this.pageSize);
    this.currentPage = 1;
    this.applyPagination();
    
    setTimeout(() => {
      this.isLoading = false;
    }, 300);
  }

  setViewMode(mode: 'card' | 'table'): void {
    this.viewMode = mode;
  }

  goToPage(page: number): void {
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

  applyPagination(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredRoomTypes = this.roomTypes.slice(startIndex, Math.min(endIndex, this.roomTypes.length));
  }

  exportData(): void {
    const data = this.roomTypes.map(type => {
      return {
        'Mã loại phòng': type.id,
        'Tên loại phòng': type.typeName,
        'Số lượng phòng': this.getRoomCountByType(type.id)
      };
    });
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách loại phòng');
    
    XLSX.writeFile(workbook, 'danh-sach-loai-phong.xlsx');
  }
}
