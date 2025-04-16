import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as bootstrap from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
import { addRoom, Room } from '../../models/room.model';
import { ApiService } from '../../_service/api.service';
import { RoomTypeService, ServiceAttachDetail } from '../../models/roomtypeservice.model';
import { Pipe, PipeTransform } from '@angular/core';
import { ServiceAttach } from '../../models/serviceAttach.model';
import { NgToastService } from 'ng-angular-popup';
import { Discount } from '../../models/discount.model';
import { environment } from 'src/environments/environment.development';

interface RoomType {
    id: number;
    typeName: string;
    maxPerson: number;
}
export class Service {
    serviceAttachId!: number;
}
@Component({
    selector: 'app-room',
    templateUrl: './room.component.html',
    styleUrls: ['./room.component.css'],
})
export class RoomComponent implements OnInit {
    serviceAttachId2!: number;
    serviceAttachId3!: number;
    discount!: Discount[];
    services!: ServiceAttach[]
    selectedServiceId!: number;
    image: any;
    images: any;
    message: any;
    imagePath: any;
    imgURL: any;
    submitted = false;
    RoomId!: string;
    roomTypeId!: number;
    searchTerm: string = '';
    @Input() room: addRoom;
    rooms: Room[];
    id!: number;
    typeId!: number;
    roomForm!: FormGroup;
    roomTypes: RoomType[] = [];
    serviceAttach!: string;
    serviceCount: number = 0;
    showAll: boolean = false;
    getroomId!: string;
    get f() {
        return this.roomForm.controls;
    }
    constructor(
        private roomService: ApiService,
        private router: Router,
        private api: ApiService,
        private fb: FormBuilder,
        private http: HttpClient,
        private toastr: ToastrService,
        private toast: ToastrService
    ) {
        this.rooms = [];
        this.room = {
            roomNumber: '',
            name: '',
            isActive: true,
            description: '',
            roomPicture: '',
            roomPictures: '',
            numberOfSimpleBed: '1',
            numberOfDoubleBed: '1',
            currentPrice: 0,
            roomTypeId: 0,
            peopleNumber: '',
        };
        this.roomForm = this.fb.group({
            Name: ['', [Validators.required]],
            RoomNumber: ['', [Validators.required]],
            IsActive: [true, [Validators.required]],
            Description: [''],
            CurrentPrice: ['0', [Validators.required]],
            RoomPicture: [''],
            RoomPictures: [''],
            PeopleNumber: ['1', [Validators.required]],
            NumberOfSimpleBed: ['1', [Validators.required]],
            NumberOfDoubleBed: ['1', [Validators.required]],
            RoomTypeId: ['1', [Validators.required]],
            roomId: [''],
            discountId: ['']
        });
    }

    ngOnInit(): void {
        // this.loadModal();
        // this.submitted = false;
        // this.api.getRoomTypeId().subscribe((data: any)=>{
        //   this.roomTypes = data.roomTypes;
        //   this.typeId = data.roomTypes.id
        // });
        this.getRooms();
        this.getRoomtype();
        this.getAllDiscountType2()
        this.getAllService();
    }
    uploadFileDetail = (event: any) => {
        let files = event.target.files;
        if (files.length === 0) {
            return;
        }
        if (files.length > 0) {
            this.images = files;
            // var mimeType = files[0].type;
            // if (mimeType.match(/image\/*/) == null) {
            //   this.message = "Only images are supported.";
            //   return;
            // }
            // var reader = new FileReader();
            // this.imagePath = files;
            // reader.readAsDataURL(files[0]);
            // reader.onload = (_event) => {
            //   this.imgURL = reader.result;
            // }
        }
    };

    uploadFile = (event: any) => {
        let files = event.target.files;
        
        if (files.length === 0) {
            return;
        }
        if (files.length === 1) {
            this.image = files;
            console.log(this.image);
            // var mimeType = files[0].type;
            // if (mimeType.match(/image\/*/) == null) {
            //     this.message = 'Only images are supported.';
            //     return;
            // }
            // var reader = new FileReader();
            // this.imagePath = files;
            // reader.readAsDataURL(files[0]);
            // reader.onload = (_event) => {
            //     this.imgURL = reader.result;
            // };
        }
    };
    getRoomtype(): Promise<number> {
        return new Promise((resolve, reject) => {
            this.api.getRoomTypeId().subscribe((data: any) => {
                this.roomTypes = data.roomTypes;
                this.typeId = data.roomTypes.id;
                resolve(this.typeId);
            }, reject);
        });
    }
    addRoom(_roomForm: FormGroup) {
        this.submitted = true;
        if (this.roomForm.invalid) {
            return;
        }
        let fileToUpload;
        let fileToUploads;
        const formData = new FormData();
        console.log(this.image);

        if (this.image == null) {
            fileToUpload = '';
            formData.append('RoomPicture', fileToUpload);
        } else {
            fileToUpload = <File>this.image[0];
            formData.append('RoomPicture', fileToUpload, fileToUpload.name);
        }
        if (this.images == null) {
            fileToUploads = '';
            formData.append('RoomPicture', fileToUploads);
        } else {
            fileToUploads = <File[]>this.images;
            fileToUploads.forEach((file) => {
                formData.append('RoomPictures', file, file.name);
            });
        }
        formData.append('RoomNumber', _roomForm.controls['RoomNumber'].value);
        formData.append('Name', _roomForm.controls['Name'].value);
        formData.append('IsActive', _roomForm.controls['IsActive'].value);
        formData.append('Description', _roomForm.controls['Description'].value);
        formData.append('CurrentPrice', _roomForm.controls['CurrentPrice'].value);
        formData.append('RoomPictures', '');
        formData.append('PeopleNumber', _roomForm.controls['PeopleNumber'].value);
        formData.append(
            'NumberOfSimpleBed',
            _roomForm.controls['NumberOfSimpleBed'].value
        );
        formData.append(
            'NumberOfDoubleBedBed',
            _roomForm.controls['NumberOfDoubleBed'].value
        );
        formData.append('RoomTypeId', _roomForm.controls['RoomTypeId'].value);
        this.http
            .post<any>(
                environment.BASE_URL_API + `/v2/admin/room/create`,
                formData
            )
            .subscribe(
                (res) => {
                    $("#addRoom").attr("data-bs-dismiss", "modal");
                    this.getRooms();
                    this.loadModal();
                    $("#staticBackdrop").modal("toggle");
                    this.toastr.success(res.message);
                },
                (_err) => {
                    alert(_err);
                }
            );
    }

    getRooms() {
        this.roomService.getRooms().subscribe((res: any) => {
            this.rooms = res;
        });
    }
    routePage() {
        this.router.navigate(['/room-detail/{{room.id}}']);
    }

    loadModal() {
        this.submitted = false;
        this.roomForm = this.fb.group({
            Name: ['', [Validators.required]],
            RoomNumber: ['', [Validators.required]],
            IsActive: [true, [Validators.required]],
            Description: [''],
            CurrentPrice: ['0', [Validators.required]],
            RoomPicture: [''],
            RoomPictures: [''],
            PeopleNumber: ['1', [Validators.required]],
            NumberOfSimpleBed: ['1', [Validators.required]],
            NumberOfDoubleBed: ['1', [Validators.required]],
            RoomTypeId: ['1', [Validators.required]],
        });
    }



    loadModalUpdate(roomId: string) {
        this.api.getRoomDetail(roomId).subscribe((res) => {
            this.roomForm = this.fb.group({
                Name: [res?.name, [Validators.required]],
                RoomNumber: [res?.roomNumber, [Validators.required]],
                IsActive: [res?.isActive, [Validators.required]],
                Description: [res?.description],
                CurrentPrice: [res?.currentPrice, [Validators.required]],
                discountPrice: [res?.discountPrice],
                RoomPicture: [res?.roomPicture],
                RoomPictures: [res?.roomPictures],
                PeopleNumber: ['1', [Validators.required]],
                NumberOfSimpleBed: [res?.numberOfSimpleBed, [Validators.required]],
                NumberOfDoubleBed: [res?.numberOfDoubleBed, [Validators.required]],
                RoomTypeId: [res.roomTypeId, [Validators.required]],
            });
            this.RoomId = res.id;
        });
    }

    resetModal() {
        this.submitted = false;
        this.roomForm = this.fb.group({
            Name: ['', [Validators.required]],
            RoomNumber: ['', [Validators.required]],
            IsActive: [true, [Validators.required]],
            Description: [''],
            CurrentPrice: ['0', [Validators.required]],
            RoomPicture: [''],
            RoomPictures: [''],
            PeopleNumber: ['1', [Validators.required]],
            NumberOfSimpleBed: ['1', [Validators.required]],
            NumberOfDoubleBed: ['1', [Validators.required]],
            RoomTypeId: ['1', [Validators.required]],
        });
    }

    updateRoom(_roomForm2: FormGroup) {
        // Identity roomId
        // this.api.deleteRoom(roomId)
        // if (this.roomForm.invalid) {
        //   return;
        // }

        let fileToUpload: File | undefined;
        let fileToUploads: File[] | undefined;
        const formData = new FormData();
        console.log(this.image);

        if (this.image == undefined) {
            fileToUpload = undefined;
            formData.append('RoomPicture', '');
        } else {
            fileToUpload = this.image[0] as File;
            console.log(fileToUpload);

            formData.append('RoomPicture', fileToUpload, fileToUpload.name);
        }

        if (this.images == undefined) {
            fileToUploads = undefined;
            formData.append('RoomPictures', '');
        } else {
            fileToUploads = this.images as File[];
            fileToUploads.forEach((file) => {
                formData.append('RoomPictures', file, file.name);
            });
        }

        formData.append('RoomNumber', _roomForm2.controls['RoomNumber'].value);
        formData.append('Name', _roomForm2.controls['Name'].value);
        formData.append('IsActive', _roomForm2.controls['IsActive'].value);
        formData.append('Description', _roomForm2.controls['Description'].value);
        formData.append('CurrentPrice', _roomForm2.controls['CurrentPrice'].value);
        formData.append('PeopleNumber', _roomForm2.controls['PeopleNumber'].value);
        formData.append(
            'NumberOfSimpleBed',
            _roomForm2.controls['NumberOfSimpleBed'].value
        );
        formData.append(
            'NumberOfDoubleBedBed',
            _roomForm2.controls['NumberOfDoubleBed'].value
        );
        formData.append('RoomTypeId', _roomForm2.controls['RoomTypeId'].value);

        this.http
            .post<any>(
                environment.BASE_URL_API + `/v2/admin/room/update?id=${this.RoomId}`,
                formData
            )
            .subscribe(
                (res) => {
                    $("#editRoom").modal("toggle");
                    this.getRooms();
                    // this.loadModal(this.roomForm.value);
                    this.toastr.success(res.message);
                },
                (err) => {
                    this.toastr.error(err.message);
                }
            );
    }

    deleteRoom(id: string) {
        if (confirm('Are you want to delete this room?')) {
            //   this.rooms.forEach((value, index) =>{
            //     if(value.id == parseInt(id)){
            //       this.api.deleteRoom(id).subscribe((res) =>{
            //         this.rooms.splice(index, 1)
            //       });
            //     }
            //   });
            // }
            this.api.deleteRoom(id).subscribe({
                next: (_res) => {
                    this.toastr.success('Room deleted!');
                    this.getRooms();
                },
                error: (_err) => {
                    this.toastr.error(_err.message);
                },
            });
        }
    }

    /////////////////////////////////////////////////ServiceAttachDetailAdmin

    getAllService() {
        this.api.getAllService().subscribe((res: any) => {
            this.services = res;
            
           

        });
    }
    onServiceSelectionChange(e:  any): void {
        const selectedDiscountId: number = parseInt(e.target.value, 10);
        this.serviceAttachId2 = selectedDiscountId
       

    }
    toggleSelection(roomtypeId: number, roomId: string) {
        this.roomTypeId = roomtypeId;
        this.getroomId = roomId
    }

    addService(e: any) {
        const serviceAttachId = this.serviceAttachId2 || 0;
        this.api.createAttachService(this.roomTypeId, serviceAttachId).subscribe(response => {
            console.log(response);

           this.toastr.success("Add Successfully!")
           this.getAllService()
        }, error => {
            this.toast.error('Failed to add service:',error.error.message);
        });
    }

    showAllServices() {
        // this.serviceCount = this.services..length;
        alert(this.serviceCount)
        this.showAll = true;
      }
      countDisplayedServices(roomIndex: number): number {
        const room = this.rooms[roomIndex];
        if (room && room.serviceAttachs) {
          return room.serviceAttachs.length;
        }
        return 0;
      }
      getAllDiscountType2() {
        this.api.getAllDiscount().subscribe((res: any) => {
            this.discount = res
            console.log(res);

        })
    }
      addDiscountRoom(roomForm: FormGroup): void{
     console.log(this.getroomId);
     console.log(this.serviceAttachId2);
     
        
      
        this.api.createDiscountForRoom(this.getroomId, this.serviceAttachId2).subscribe(res=>{
            this.toast.success(res.message);
        },err=>{
            this.toast.error(err.error.message);
        })
    }
}
