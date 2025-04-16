import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment.development';
import { FormControl } from '@angular/forms';
import { userProfile } from 'src/app/models/userProfile.model';
import { UserService } from 'src/app/_service/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: "app-user-profile",
    templateUrl: "./user-profile.component.html",
    styleUrls: ["./user-profile.component.css"],
})
export class UserProfileComponent implements OnInit {
    updateProfile!: FormGroup;
    loading = false;
    submitted = false;
    userProfile = new userProfile();
    files: any;
    imagePath: any;
    imgURL: any;
    message: any;
    constructor(
        private http: HttpClient,
        private fb: FormBuilder,
        private route: Router,
        private toast: ToastrService,
        private userService: UserService
    ) {}
    get f() {
        return this.updateProfile.controls;
    }
    ngOnInit(): void {
        this.updateProfile = this.fb.group({
            CMND: ["", [Validators.required, Validators.pattern("[0-9 ]{12}")]],
            PhoneNumber: [
                "",
                [Validators.required, Validators.pattern("[0-9 ]{10}")],
            ],
            Address: ["", Validators.required],
        });
        this.getUserProfile();
    }
    uploadFile = (files: any) => {
        this.files = files;
        if (files.length === 0) return;

        var mimeType = files[0].type;
        if (mimeType.match(/image\/*/) == null) {
            this.message = "Only images are supported.";
            return;
        }

        var reader = new FileReader();
        this.imagePath = files;
        reader.readAsDataURL(files[0]);
        reader.onload = (_event) => {
            this.imgURL = reader.result;
        };
    };
    getUserProfile(): void {
        this.userService.getUserProfile().subscribe((res) => {
            this.userProfile = res;
            this.updateProfile.controls["Address"].setValue(
                this.userProfile.address
            );
            this.updateProfile.controls["PhoneNumber"].setValue(
                this.userProfile.phoneNumber
            );
            this.updateProfile.controls["CMND"].setValue(this.userProfile.cmnd);
        });
    }

    updateUserProfile(updateProfile: FormGroup) {
        let fileToUpload;
        const formData = new FormData();
        if (this.files == null) {
            fileToUpload = "";
            formData.append("Image", fileToUpload);
        } else {
            fileToUpload = <File>this.files[0];
            formData.append("Image", fileToUpload, fileToUpload.name);
        }
        formData.append(
            "Address",
            this.updateProfile.controls["Address"].value
        );
        formData.append(
            "PhoneNumber",
            this.updateProfile.controls["PhoneNumber"].value
        );
        formData.append("CMND", this.updateProfile.controls["CMND"].value);
        this.http
            .post<any>(
                environment.BASE_URL_API + `/user/user-profile/update`,
                formData
            )
            .subscribe((res) => {
                this.toast.success(res.message);
            });
    }

    OnSubmit() {
        // this.loading = true;
        if (this.updateProfile.invalid) {
            return;
        }
        this.updateUserProfile(this.updateProfile);
    }
}

