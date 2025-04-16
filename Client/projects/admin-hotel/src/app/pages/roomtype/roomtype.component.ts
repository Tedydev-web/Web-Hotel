import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../_service/api.service';
import { roomType } from '../../models/room.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
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
  constructor(private api: ApiService, private fb: FormBuilder, private toast: ToastrService){
    this.nameTypeForm = this.fb.group({
      TypeName : ['']
    })
  }
  ngOnInit(): void {
    this.api.getAllRoomType().subscribe( res => {
        this.roomType = res;
        this.roomTypes = res;
      })
  }

  getAll(){
    this.api.getAllRoomType().subscribe( res => {
        this.roomType = res;
        this.roomTypes = res;
      })
  }
  searchBookings() {
    // Chuyển đổi từ khóa tìm kiếm thành chữ thường
    const searchTerm = this.searchRoomType.toLowerCase();
    // Lọc các đặt phòng dựa trên từ khóa tìm kiếm
    this.roomType = this.roomType.filter((item) =>
    item.typeName.toLowerCase().includes(searchTerm) ||
    item.id.toString().includes(searchTerm)
 
    );
   this.searchRoomType = ''
    
  }
  clearSearch() {
    this.roomType = this.roomTypes
  }
 
  createRoomType(nameTypeForm: FormGroup){
    // const nameType = this.nameTypeForm?.get('nameType')?.value;
    return this.api.createRoomType(nameTypeForm.value).subscribe( res=>{

      this.toast.success("Add successfully!");
    }, err => {
      this.toast.error(err)
    })
  }
  fetchModal(){
    this.nameTypeForm = this.fb.group({
        TypeName : [this.nameRoomType]
    })
  }
  update( nameTypeForm: FormGroup){
       
      this.api.updateRoomTypeName(this.roomTypeId, nameTypeForm.value)
        .subscribe(
          () => {
            this.toast.success("Add successfully!");
            this.getAll()
          },
          error => {
            this.toast.error('Something was wrong:', error);
            // Xử lý lỗi nếu có
          }
        );

  }

  toggleSelection(itemId: string, nametypeRoom: string) {
    this.roomTypeId = itemId;
    this.nameRoomType = nametypeRoom
    this.fetchModal()
  }

  deleteType(id: number){
    this.api.deleteRoomType(id).subscribe(res=>{
      this.toast.success("Delete successfully!");
      this.getAll();
    },err =>{
      this.toast.error(err);
    })
  }
}
