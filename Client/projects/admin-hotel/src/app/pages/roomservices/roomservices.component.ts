import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { roomType } from '../../models/room.model';
import { ApiService } from '../../_service/api.service';
import { ToastrService } from 'ngx-toastr';
import { ServiceAttach } from '../../models/serviceAttach.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-roomservices',
  templateUrl: './roomservices.component.html',
  styleUrls: ['./roomservices.component.css']
})
export class RoomservicesComponent {


  id!: number;
  roomType!: ServiceAttach[];

  serviceForm!: FormGroup;
  constructor(private api: ApiService, private fb: FormBuilder, private toast: ToastrService){
    this.serviceForm = this.fb.group({
      name : [''],
      icon : [''],
      description : [''],
      // icon
    })
  }
  ngOnInit(): void {
    this.api.getAllService().subscribe(res => {
      this.roomType = res;
      console.log(res);

    })
  }

  getAll(){
    return this.api.getAllService().subscribe(res => {
      this.roomType = res;
    })
  }
  
  toggleSelection(itemId: number) {
    this.id = itemId;
}
  createRoomType(serviceForm: FormGroup){
    // const service = this.serviceForm?.get('service')?.value;
    return this.api.createService(serviceForm.value).subscribe( res=>{

      this.toast.success("Add successfully!");
      this.getAll();
    }, err => {
      this.toast.error(err);
    })
  }
  update(serviceForm: FormGroup){
     this.api.updateService(serviceForm.value, this.id).subscribe( res =>{
      this.toast.success("Update successfully!");
      this.getAll();

    }, err => {
      this.toast.error(err);
    })
  }
  deleteService(id: number){

    this.api.deleteService(id).subscribe(res=>{
      this.toast.success("Delete successfully!");
      this.getAll()
    },err =>{
      this.toast.error(err);
    })
  }
}
