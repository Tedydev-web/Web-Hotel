import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { roomType } from '../../models/room.model';
import { ApiService } from '../../_service/api.service';
import { ToastrService } from 'ngx-toastr';
import { ServiceAttach } from '../../models/serviceAttach.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Discount } from '../../models/discount.model';

@Component({
    selector: 'app-discount',
    templateUrl: './discount.component.html',
    styleUrls: ['./discount.component.css']
})
export class DiscountComponent {
    serviceAttachId2!: number;
    discount!: Discount[];
    discountId!: number;
    id!: number;
    discountLength!: number;  
    roomType!: Discount[];
    roomTypeResult!: Discount[];
    searchTerm: string = '';
    serviceForm!: FormGroup;
    constructor(private api: ApiService, private fb: FormBuilder, private toast: ToastrService) {
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
        this.api.getAllDiscount().subscribe(res => {
            this.roomType = res
            this.roomTypeResult = res
            console.log(res);

            this.filterExpiredDiscounts()
        })
        this.getAllDiscountType()

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

    searchBookings() {
        // Chuyển đổi từ khóa tìm kiếm thành chữ thường
        const searchTerm = this.searchTerm.toLowerCase();
        // Lọc các đặt phòng dựa trên từ khóa tìm kiếm
        this.roomType = this.roomType.filter((item) =>
            item.discountCode.toLowerCase().includes(searchTerm) ||
            item.name.toLowerCase().includes(searchTerm)

        );
        this.searchTerm = ''

    }
    clearSearch() {
        this.roomType = this.roomTypeResult
    }

    getId(id: number) {
        this.discountId = id

    }
    getAll() {
        return this.api.getAllDiscount().subscribe(res => {
            this.roomType = res;
        })
    }
    createRoomType(serviceForm: FormGroup) {
        // const service = this.serviceForm?.get('service')?.value;
        this.serviceForm.controls["discountTypeId"].setValue(this.serviceAttachId2);  
        return this.api.createDiscount(serviceForm.value).subscribe(res => {
            this.toast.success("Add successfully!");
            this.getAll();
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
            this.getAll();

        }, err => {
            this.toast.error(err);
        })
    }
    deleteDiscount(id: number) {

        this.api.deleteDiscount(id).subscribe(res => {
            this.toast.success("Delete successfully!");
            this.getAll()
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
    filterExpiredDiscounts(): void {
        const currentDate = new Date();
        this.roomType = this.roomType.filter(roomType => {
            this.discountLength = this.roomType.length
            const checkoutDate = new Date(roomType.endAt);
            if (checkoutDate >= currentDate) {

                return true;
            }
            this.discountLength = 0
            return false;
        });
    }

   
}
