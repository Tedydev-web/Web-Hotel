import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Room, roomType } from '../../models/room.model';
import { ApiService } from '../../_service/api.service';
import { ToastrService } from 'ngx-toastr';
import { ServiceAttach } from '../../models/serviceAttach.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Discount } from '../../models/discount.model';
import { RoleService } from '../../_service/role.service';
import { Roles } from '../../models/roles.model';
@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent {
    serviceAttachId2!: number;
    discount!: Discount[];
    discountId!: number;
    id!: number;
    roomType!: Roles[];
    roomTypeResult!: Room;
    searchTerm: string = '';
    serviceForm!: FormGroup;
    constructor(private api: ApiService, private fb: FormBuilder, private toast: ToastrService, private role: RoleService) {
        this.serviceForm = this.fb.group({
            discountCode: [''],
            name: [''],
            discountPercent: [''],
            amountUse: [''],
            startAt: [''],
            endAt: [''],
            isPermanent: [''],
            discountTypeId: [''],
            
        })
    }
    ngOnInit(): void {
        this.role.getAllRoles().subscribe(res => {
            this.roomType = res
            console.log(res);

        })
        // this.getAllDiscountType()

    }


    loadModal(id: number) {
        this.getId(id)
        this.api.getDiscountId(this.discountId).subscribe((res) => {
            this.serviceForm = this.fb.group({
                discountCode: [res?.discountCode],
                name: [res?.name],
                discountPercent: [res?.discountPercent],
                amountUse: [res?.amountUse],
                startAt: [res?.startAt],
                endAt: [res?.endAt],
                isPermanent: [res?.isPermanent],
                discountTypeId: [res?.discountTypeId],
            })
        })
    }
    clearModal() {
        this.serviceForm = this.fb.group({
            discountCode: [''],
            name: [''],
            discountPercent: [''],
            amountUse: [''],
            startAt: [''],
            endAt: [''],
            isPermanent: [''],
            discountTypeId: [''],
        })

    }

    
    
    getId(id: number) {
        this.discountId = id

    }
   
    createRoomType(serviceForm: FormGroup) {
        // const service = this.serviceForm?.get('service')?.value;
        this.serviceForm.controls["discountTypeId"].setValue(this.serviceAttachId2);  
        return this.api.createDiscount(serviceForm.value).subscribe(res => {
            this.toast.success("Add successfully!");
        }, err => {
            this.toast.error(err);
        })
    }
    onServiceSelectionChange(e: any): void {
        const selectedServiceId: number = parseInt(e.target.value[0], 10);
        this.serviceAttachId2 = selectedServiceId
    }
    update(serviceForm: FormGroup) {
        
        this.api.updateDiscount(serviceForm.value, this.discountId).subscribe(res => {
            this.toast.success("Update successfully!");

        }, err => {
            this.toast.error(err);
        })
    }
    deleteDiscount(id: number) {

        this.api.deleteDiscount(id).subscribe(res => {
            this.toast.success("Delete successfully!");
        }, err => {
            this.toast.error(err);
        })
    }
    getAllDiscountType() {
        this.api.getAllDiscountType().subscribe((res: any) => {
            this.discount = res
            console.log(res);

        })
    }
   
}
