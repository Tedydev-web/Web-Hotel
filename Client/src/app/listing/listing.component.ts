import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ApiService } from '../_service/api.service';
import { Router } from '@angular/router';
import { AuthService } from '../_service/auth.service';
import { SearchService } from '../_service/search.service';
import { Room } from '../models/room.model';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment.development';
import { Booking } from '../models/booking.model ';
import { userProfile } from '../models/userProfile.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as $ from 'jquery';
import { ServiceAttach } from '../models/serviceAttach.model';

const today = new Date();
const month = today.getMonth();
const year = today.getFullYear();

interface RoomType {
  id: number;
  typeName: string;
  maxPerson: number;
}

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.scss'],
})
export class ListingComponent implements OnInit, AfterViewInit, OnDestroy {
  results!: number;
  page: number = 1;
  count: number = 0;
  filteredRooms!: Room[];
  tableSize: number = 5;
  tableSizes: any = [3, 6, 9, 12];
  maxPerson!: any;
  maxPrice = 0;
  minPrice = 0; // Added missing property
  roomTypes: RoomType[] = [];
  serviceAttachs: ServiceAttach[] = [];
  roomSearchForm!: FormGroup;
  roomTypeName: RoomType[] = [];
  peopleNumberOptions: any;
  checkInDate: any;
  checkOutDate: any;
  checkInDateString: any;
  checkOutDateString: any;
  peopleNumber: any;
  roomTypeId: any;

  // Biến cho bộ lọc nâng cao
  minPriceFilter: number = 0;
  maxPriceFilter: number = 10000000;
  selectedRating: number = 0;
  selectedAmenities: string[] = [];
  maxPriceValue: number = 10000000; // Giá trị tối đa mặc định
  
  // Observable để hủy subscription khi component bị hủy
  private destroy$ = new Subject<void>();

  constructor(
    private roomService: ApiService,
    private router: Router,
    private http: HttpClient,
    private apiService: ApiService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private toast: ToastrService
  ) {
    this.roomSearchForm = this.fb.group({
      peopleNumber: '',
      roomTypeId: '',
    });
  }

  date = new FormControl(new Date());
  checkIn = new FormControl(new Date().toISOString());
  checkOut = new FormControl(new Date().toISOString());
  ngOnInit(): void {
    if (localStorage.getItem('loadPage') == 'true') {
      location.reload();
      localStorage.removeItem('loadPage');
    }
    
    this.apiService.searchRoom().subscribe((data: any) => {
      this.maxPerson = data.maxPerson;
      this.maxPrice = data.maxPrice;
      this.maxPriceValue = data.maxPrice; // Lưu giá trị tối đa từ API
      this.maxPriceFilter = data.maxPrice; // Cập nhật giá trị tối đa cho bộ lọc
      this.roomTypeName = data.roomTypes;
      this.serviceAttachs = data.serviceAttachs;
    });

    this.checkInDate = new Date(
      new Date(this.route.snapshot.paramMap.get('checkIn')!).setHours(7, 0, 0)
    );
    this.checkOutDate = new Date(
      new Date(this.route.snapshot.paramMap.get('checkOut')!).setHours(7, 0, 0)
    );
    this.peopleNumber = this.route.snapshot.paramMap.get('person');
    this.roomTypeId = this.route.snapshot.paramMap.get('roomTypeId');
    this.getRoomSearch();
    this.checkInDateString = this.checkInDate.toISOString();
    this.checkOutDateString = this.checkOutDate.toISOString();

    this.checkIn.setValue(this.checkInDate.toISOString());

    this.checkOut.setValue(this.checkOutDate.toISOString());

    this.peopleNumberOptions = Array.from(
      { length: this.maxPerson },
      (v, k) => k + 1
    );

    this.roomSearchForm.controls['peopleNumber'].setValue(
      Number.parseInt(this.peopleNumber)
    );
    this.roomSearchForm.controls['roomTypeId'].setValue(
      Number.parseInt(this.roomTypeId)
    );
    this.sortMaxPersonArrayDescending();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setupPriceSlider();
      this.initFilterCardToggle();
      this.setupFilterInteractions();
    }, 500);
  }
  
  ngOnDestroy() {
    // Gửi tín hiệu khi component bị hủy để dừng mọi subscription
    this.destroy$.next();
    this.destroy$.complete();
  }

  getFullRooms() {
    this.apiService.searchRoom().subscribe((data: any) => {
      this.maxPerson = Array(data.maxPerson)
        .fill(1)
        .map((x, i) => i + 1);
      this.maxPrice = data.maxPrice;
      console.log(this.maxPrice);

      this.roomTypes = data.roomTypes;
      this.serviceAttachs = data.serviceAttachs;
    });

    this.apiService.getRooms().subscribe(
      (rooms: Room[]) => {
        this.filteredRooms = rooms;
      },
      (error: any) => {
        console.log(error);
      }
    );
  }
  sortMaxPersonArrayDescending() {
    this.maxPersonArray.sort((a, b) => a - b);
  }

  get maxPersonArray(): number[] {
    return Array.from({ length: this.maxPerson }, (_, i) => this.maxPerson - i);
  }

  getRooms() {
    this.roomService.getRooms().subscribe((res: any) => {
      this.filteredRooms = res;
    });
  }

  getRoomDetail(id: string) {
    this.roomService.getRoomDetail(id).subscribe((res: any) => {
      localStorage.setItem('bookedRoom', JSON.stringify(res));
    });
  }

  calculateDiscounts(rooms: Room[]): Room[] {
    return rooms.map(room => {
      // Tính phần trăm giảm giá nếu có discountPrice
      if (room.currentPrice && room.discountPrice && room.currentPrice > room.discountPrice) {
        const discountPercent = Math.round(((room.currentPrice - room.discountPrice) / room.currentPrice) * 100);
        room.discount = discountPercent;
      } else {
        room.discount = 0;
      }
      return room;
    });
  }

  getRoomSearch() {
    var payLoad = {
      checkIn: this.checkInDate,
      checkOut: this.checkOutDate,
      price: 0,
      typeRoomId: this.roomTypeId == '' ? 0 : this.roomTypeId,
      star: 0,
      peopleNumber: this.peopleNumber == '' ? 0 : this.peopleNumber,
    };
    
    // Hiển thị trạng thái loading
    const roomListContainer = document.querySelector('.shop-grid-contents');
    if (roomListContainer) {
      roomListContainer.classList.add('loading');
    }
    
    this.http
      .post<Room[]>(environment.BASE_URL_API + `/user/room/get-all-by`, payLoad)
      .subscribe(
        (res) => {
          this.filteredRooms = this.calculateDiscounts(res);
          
          // Loại bỏ trạng thái loading
          if (roomListContainer) {
            roomListContainer.classList.remove('loading');
          }
          
          // Hiển thị thông báo nếu không có kết quả
          if (this.filteredRooms.length === 0) {
            this.toast.info('Không tìm thấy phòng phù hợp');
          }
        },
        (_err) => {
          this.toast.error(_err.message || 'Có lỗi xảy ra khi tìm kiếm phòng');
          
          // Loại bỏ trạng thái loading
          if (roomListContainer) {
            roomListContainer.classList.remove('loading');
          }
        }
      );
  }

  routePage() {
    this.router.navigate(['/room-detail/{{room.id}}']);
  }
  onTableDataChange(event: any) {
    this.page = event;
    this.getRooms();
  }
  onTableSizeChange(event: any): void {
    this.tableSize = event.target.value;
    this.page = 1;
    this.getRooms();
  }
  deleteData() {
    // Xóa dữ liệu khỏi URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { data: null },
      queryParamsHandling: 'merge',
    });
  }

  clear() {
    // Clear bộ lọc cơ bản
    this.roomSearchForm.controls['peopleNumber'].setValue(0);
    this.roomSearchForm.controls['roomTypeId'].setValue(0);
    
    // Clear bộ lọc đánh giá
    this.selectedRating = 0;
    const ratingItems = document.querySelectorAll('.rating-item');
    ratingItems.forEach(item => item.classList.remove('active'));
    
    // Clear bộ lọc giá
    this.minPriceFilter = 0;
    this.maxPriceFilter = this.maxPriceValue;
    
    // Clear bộ lọc giá nhanh
    const priceTags = document.querySelectorAll('.price-tag');
    priceTags.forEach(tag => tag.classList.remove('active'));

    // Clear bộ lọc tiện nghi
    const amenityCheckboxes = document.querySelectorAll('.amenity-checkbox') as NodeListOf<HTMLInputElement>;
    amenityCheckboxes.forEach(checkbox => {
      checkbox.checked = false;
    });
    this.selectedAmenities = [];
    
    // Cập nhật UI slider
    this.updateSliderPositions(0, this.maxPriceValue);
    
    // Hiển thị loading state
    const roomListContainer = document.querySelector('.shop-grid-contents');
    if (roomListContainer) {
      roomListContainer.classList.add('loading');
    }
    
    // Lấy lại toàn bộ danh sách phòng
    this.getRoomSearch();
    
    // Hiển thị thông báo
    this.toast.info('Đã xóa tất cả bộ lọc');
  }

  onSubmit() {
    var star = 0;
    var starTemp = $('.single-shop-left .item.active').data('value');
    if (starTemp != undefined) {
      star = starTemp;
    }

    const roomTypeId = this.roomSearchForm.value.roomTypeId;
    const peopleNumber = this.roomSearchForm.value.peopleNumber;

    const checkInValue = this.checkIn.value;
    const checkOutValue = this.checkOut.value;

    if (!checkInValue || !checkOutValue) {
      // Handle error when check-in or check-out values are not set
      return;
    }
    var checkInDate = new Date(checkInValue);
    checkInDate = new Date(checkInDate.setHours(7, 0, 0));
    var checkOutDate = new Date(checkOutValue);
    checkOutDate = new Date(checkOutDate.setHours(7, 0, 0));
    const numberOfNights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    this.checkInDateString = checkInDate.toISOString();
    this.checkOutDateString = checkOutDate.toISOString();

    var price = $('.price_search').val();

    const numDays = numberOfNights;
    var payLoad = {
      checkIn: checkInDate.toISOString(),
      checkOut: checkOutDate.toISOString(),
      price: price,
      typeRoomId: roomTypeId == '' ? 0 : roomTypeId,
      star: star,
      peopleNumber: peopleNumber == '' ? 0 : peopleNumber,
    };
    console.log(payLoad);


    if (numDays > 0) {
      this.deleteData;
      this.http
        .post<Room[]>(
          environment.BASE_URL_API + `/user/room/get-all-by`,
          payLoad
        )
        .subscribe(
          (res) => {
            this.filteredRooms = this.calculateDiscounts(res);
            this.router.navigate([
              '/room-listing',
              checkInDate.toISOString(),
              checkOutDate.toISOString(),
              this.roomSearchForm.controls['peopleNumber'].value,
              this.roomSearchForm.controls['roomTypeId'].value,
            ]);
          },
          (_err) => {
            console.log(_err);
          }
        );
    } else {
      this.toast.error('You have to select to Checkout day!');
    }
  }

  bookingRoom(idRoom: any) {
    const checkInValue = this.checkIn.value;
    const checkOutValue = this.checkOut.value;
    if (!checkInValue || !checkOutValue) {
      return;
    }
    const checkInDate = new Date(checkInValue);
    const checkOutDate = new Date(checkOutValue);
    const numberOfNights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    var userProfileLocal = new userProfile();
    if (localStorage.getItem('user_profile')!.length > 0) {
      let result = localStorage.getItem('user_profile')!;
      userProfileLocal = JSON.parse(result) as userProfile;
    }
    var payLoad = new Booking();
    payLoad.startDate = checkInDate;
    payLoad.endDate = checkOutDate;
    payLoad.roomId = idRoom;
    payLoad.numberOfDay = numberOfNights;
    payLoad.name = userProfileLocal.userName;
    payLoad.email = userProfileLocal.email;
    payLoad.phoneNumber = userProfileLocal.phoneNumber;
    payLoad.address = userProfileLocal.address;

    this.http
      .post<any>(`${environment.BASE_URL_API}/user/reservation/create`, payLoad)
      .subscribe(
        (res) => {
          this.toast.success(res.message);
          this.router.navigate(['/checkout', res.reservationId]);
        },
        (_err) => {
          const wrongtime = _err.error.title;
          if (wrongtime) {
            this.toast.error(_err.error.title);
          } else {
            this.toast.error(_err.error.message);
          }
        }
      );
  }

  /**
   * Thiết lập bộ lọc giá và các tương tác
   */
  setupPriceSlider() {
    // Đợi để đảm bảo giá trị maxPrice đã được lấy từ API
    setTimeout(() => {
      // Khởi tạo bộ lọc giá
      this.initPriceSlider();
    }, 300);
  }

  /**
   * Thiết lập các tương tác cho bộ lọc
   */
  setupFilterInteractions() {
    // Đợi để đảm bảo DOM đã render
    setTimeout(() => {
      // Xử lý sự kiện cho các nút lọc giá nhanh
      const priceTags = document.querySelectorAll('.price-tag');
      priceTags.forEach(tag => {
        tag.addEventListener('click', (e) => {
          const element = e.currentTarget as HTMLElement;
          const minPrice = parseInt(element.getAttribute('data-min-price') || '0');
          const maxPrice = parseInt(element.getAttribute('data-max-price') || String(this.maxPriceValue));
          
          // Xóa class active cũ
          priceTags.forEach(t => t.classList.remove('active'));
          // Thêm class active cho tag được chọn
          element.classList.add('active');
          
          // Cập nhật giá trị
          this.minPriceFilter = minPrice;
          this.maxPriceFilter = maxPrice;
          
          // Cập nhật UI slider
          this.updateSliderPositions(minPrice, maxPrice);
          
          // Áp dụng bộ lọc
          this.filterRoomsByPrice(minPrice, maxPrice);
        });
      });
      
      // Xử lý sự kiện cho nút áp dụng bộ lọc giá
      const applyPriceBtn = document.querySelector('.apply-price-filter');
      if (applyPriceBtn) {
        applyPriceBtn.addEventListener('click', () => {
          this.applyPriceFilter();
        });
      }
      
      // Xử lý sự kiện cho các checkbox tiện nghi
      const amenityCheckboxes = document.querySelectorAll('.amenity-checkbox') as NodeListOf<HTMLInputElement>;
      amenityCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
          if (checkbox.checked) {
            this.selectedAmenities.push(checkbox.value);
          } else {
            const index = this.selectedAmenities.indexOf(checkbox.value);
            if (index > -1) {
              this.selectedAmenities.splice(index, 1);
            }
          }
          
          // Áp dụng bộ lọc tiện nghi
          if (this.selectedAmenities.length > 0) {
            this.filterRoomsByAmenities();
          } else {
            this.getRoomSearch(); // Nếu không có tiện nghi nào được chọn, lấy lại tất cả phòng
          }
        });
      });
    }, 500);
  }

  /**
   * Khởi tạo bộ lọc giá với chức năng kéo thả
   */
  initPriceSlider() {
    // Đợi để đảm bảo DOM đã được render
    setTimeout(() => {
      const slider = document.getElementById('price-slider');
      if (slider) {
        const minHandle = slider.querySelector('.price-slider-min') as HTMLElement;
        const maxHandle = slider.querySelector('.price-slider-max') as HTMLElement;
        const track = slider.querySelector('.price-slider-track') as HTMLElement;
        
        if (minHandle && maxHandle && track) {
          // Đặt vị trí ban đầu
          minHandle.style.left = '0%';
          maxHandle.style.left = '100%';
          track.style.left = '0%';
          track.style.right = '0%';
          
          // Cập nhật hiển thị
          this.updatePriceDisplay(0, this.maxPriceValue);
          
          // Khởi tạo drag events cho handle min
          this.initHandleDrag(minHandle, (percent) => {
            // Giới hạn không vượt quá handle max
            const maxPos = parseFloat(maxHandle.style.left) || 100;
            percent = Math.min(percent, maxPos - 5);
            
            // Cập nhật vị trí
            minHandle.style.left = percent + '%';
            track.style.left = percent + '%';
            
            // Tính toán giá trị tương ứng và cập nhật display
            const priceValue = Math.round((this.maxPriceValue * percent) / 100);
            this.minPriceFilter = priceValue;
            
            // Cập nhật hiển thị giá
            this.updatePriceDisplay(priceValue, this.maxPriceFilter);
          });
          
          // Khởi tạo drag events cho handle max
          this.initHandleDrag(maxHandle, (percent) => {
            // Giới hạn không vượt quá handle min
            const minPos = parseFloat(minHandle.style.left) || 0;
            percent = Math.max(percent, minPos + 5);
            
            // Cập nhật vị trí
            maxHandle.style.left = percent + '%';
            track.style.right = (100 - percent) + '%';
            
            // Tính toán giá trị tương ứng và cập nhật display
            const priceValue = Math.round((this.maxPriceValue * percent) / 100);
            this.maxPriceFilter = priceValue;
            
            // Cập nhật hiển thị giá
            this.updatePriceDisplay(this.minPriceFilter, priceValue);
          });
        }
      }
    }, 300);
  }
  
  /**
   * Khởi tạo sự kiện kéo thả cho handle
   * @param handle Phần tử handle cần xử lý
   * @param updateCallback Callback function khi vị trí thay đổi
   */
  initHandleDrag(handle: HTMLElement, updateCallback: (percent: number) => void) {
    const slider = document.getElementById('price-slider');
    if (!slider) return;
    
    handle.addEventListener('mousedown', function(e) {
      e.preventDefault();
      document.body.style.userSelect = 'none'; // Ngăn người dùng chọn text khi kéo
      
      const startX = e.clientX;
      const handleLeft = parseFloat(handle.style.left) || 0;
      
      function handleMove(moveEvent: MouseEvent) {
        moveEvent.preventDefault();
        
        const dx = moveEvent.clientX - startX;
        // Kiểm tra null trước khi truy cập slider.offsetWidth
        let newPercent = handleLeft;
        if (slider) {
          newPercent = handleLeft + (dx / slider.offsetWidth) * 100;
        }
        
        // Giới hạn trong khoảng 0-100
        newPercent = Math.max(0, Math.min(100, newPercent));
        
        // Cập nhật qua callback
        updateCallback(newPercent);
      }
      
      function handleUp() {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
        document.body.style.userSelect = ''; // Khôi phục khả năng chọn text
      }
      
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
    });
    
    // Hỗ trợ thiết bị cảm ứng
    handle.addEventListener('touchstart', function(e) {
      const touch = e.touches[0];
      e.preventDefault();
      
      const startX = touch.clientX;
      const handleLeft = parseFloat(handle.style.left) || 0;
      
      function handleTouchMove(moveEvent: TouchEvent) {
        moveEvent.preventDefault();
        
        const touch = moveEvent.touches[0];
        const dx = touch.clientX - startX;
        // Kiểm tra null trước khi truy cập slider.offsetWidth
        let newPercent = handleLeft;
        if (slider) {
          newPercent = handleLeft + (dx / slider.offsetWidth) * 100;
        }
        
        // Giới hạn trong khoảng 0-100
        newPercent = Math.max(0, Math.min(100, newPercent));
        
        // Cập nhật qua callback
        updateCallback(newPercent);
      }
      
      function handleTouchEnd() {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      }
      
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    });
  }

  /**
   * Cập nhật hiển thị giá
   */
  updatePriceDisplay(minPrice: number, maxPrice: number) {
    const minDisplay = document.querySelector('.min_price_display');
    const maxDisplay = document.querySelector('.max_price_display');
    const minInput = document.querySelector('.min_price_input') as HTMLInputElement;
    const maxInput = document.querySelector('.max_price_input') as HTMLInputElement;
    
    if (minDisplay && maxDisplay) {
      minDisplay.textContent = minPrice.toLocaleString('vi-VN');
      maxDisplay.textContent = maxPrice.toLocaleString('vi-VN');
    }
    
    if (minInput && maxInput) {
      minInput.value = minPrice.toString();
      maxInput.value = maxPrice.toString();
    }
  }
  
  /**
   * Cập nhật vị trí của slider dựa trên giá trị min và max và áp dụng bộ lọc
   */
  updateSliderPositions(minPrice: number, maxPrice: number) {
    const slider = document.getElementById('price-slider');
    if (slider) {
      const minHandle = slider.querySelector('.price-slider-min') as HTMLElement;
      const maxHandle = slider.querySelector('.price-slider-max') as HTMLElement;
      const track = slider.querySelector('.price-slider-track') as HTMLElement;
      
      if (minHandle && maxHandle && track) {
        // Tính toán phần trăm dựa trên giá trị
        const minPercent = (minPrice / this.maxPriceValue) * 100;
        const maxPercent = (maxPrice / this.maxPriceValue) * 100;
        
        // Cập nhật vị trí
        minHandle.style.left = minPercent + '%';
        maxHandle.style.left = maxPercent + '%';
        track.style.left = minPercent + '%';
        track.style.right = (100 - maxPercent) + '%';
        
        // Cập nhật giá trị minPriceFilter và maxPriceFilter
        this.minPriceFilter = minPrice;
        this.maxPriceFilter = maxPrice;
        
        // Cập nhật hiển thị giá
        this.updatePriceDisplay(minPrice, maxPrice);
        
        // Xóa active class từ tất cả price tags và thêm vào tag phù hợp
        const priceTags = document.querySelectorAll('.price-tag');
        priceTags.forEach(tag => tag.classList.remove('active'));
        
        // Tự động áp dụng bộ lọc ngay khi người dùng chọn mức giá từ các thẻ
        this.filterRoomsByPrice(minPrice, maxPrice);
        
        // Hiển thị toast thông báo
        this.toast.info(`Đã áp dụng lọc giá từ ${minPrice.toLocaleString('vi-VN')} đến ${maxPrice.toLocaleString('vi-VN')} VNĐ`);
      }
    }
  }

  /**
   * Khởi tạo chức năng đóng/mở các filter card
   */
  initFilterCardToggle() {
    setTimeout(() => {
      const filterHeaders = document.querySelectorAll('.filter-card-header');
      filterHeaders.forEach(header => {
        header.addEventListener('click', () => {
          const parent = header.closest('.filter-card');
          const body = parent?.querySelector('.filter-card-body');
          const toggleElement = parent?.querySelector('.filter-card-toggle i'); // Chọn icon thay vì div
          
          if (body && toggleElement) {
            // Chuyển đổi kiểu Element sang HTMLElement
            const toggle = toggleElement as HTMLElement;
            
            if (body.classList.contains('d-none')) {
              body.classList.remove('d-none');
              toggle.classList.remove('active');
              toggle.style.transform = 'rotate(0deg)';
            } else {
              body.classList.add('d-none');
              toggle.classList.add('active');
              toggle.style.transform = 'rotate(180deg)';
            }
          }
        });
      });
    }, 300);
  }

  /**
   * Áp dụng bộ lọc giá
   */
  applyPriceFilter() {
    // Đảm bảo giá trị minPriceFilter và maxPriceFilter đã được cập nhật
    const minPrice = this.minPriceFilter;
    const maxPrice = this.maxPriceFilter;
    
    // Log để debug
    console.log('Applying price filter:', minPrice, maxPrice);
    
    // Hiển thị hiệu ứng loading nếu cần
    const applyButton = document.querySelector('.apply-price-filter') as HTMLButtonElement;
    if (applyButton) {
      // Thêm class loading và vô hiệu hóa nút
      applyButton.classList.add('loading');
      applyButton.disabled = true;
      
      // Thay đổi text
      const originalText = applyButton.innerHTML;
      applyButton.innerHTML = '<i class="las la-spinner la-spin"></i> Đang áp dụng...';
      
      // Áp dụng bộ lọc
      this.filterRoomsByPrice(minPrice, maxPrice);
      
      // Sau 800ms khôi phục nút
      setTimeout(() => {
        applyButton.classList.remove('loading');
        applyButton.disabled = false;
        applyButton.innerHTML = originalText;
      }, 800);
    } else {
      // Nếu không tìm thấy nút, vẫn áp dụng bộ lọc
      this.filterRoomsByPrice(minPrice, maxPrice);
    }
    
    // Thêm class active cho price tag tương ứng nếu có
    this.updateActivePriceTag(minPrice, maxPrice);
  }
  
  /**
   * Cập nhật active tag tương ứng với khoảng giá
   */
  updateActivePriceTag(minPrice: number, maxPrice: number) {
    const priceTags = document.querySelectorAll('.price-tag');
    
    // Xóa active class từ tất cả tags
    priceTags.forEach(tag => tag.classList.remove('active'));
    
    // Kiểm tra xem có price tag nào tương ứng với khoảng giá không
    let matchFound = false;
    priceTags.forEach(tag => {
      const tagMin = parseInt((tag as HTMLElement).getAttribute('data-min-price') || '0');
      const tagMax = parseInt((tag as HTMLElement).getAttribute('data-max-price') || '0');
      
      if (tagMin === minPrice && tagMax === maxPrice) {
        tag.classList.add('active');
        matchFound = true;
      }
    });
    
    // Nếu không có tag nào phù hợp, không cần thêm active class
  }

  /**
   * Lọc phòng theo giá
   */
  filterRoomsByPrice(minPrice: number, maxPrice: number) {
    // Cập nhật giá trị minPriceFilter và maxPriceFilter
    this.minPriceFilter = minPrice;
    this.maxPriceFilter = maxPrice;
    
    var payLoad = {
      checkIn: this.checkInDate,
      checkOut: this.checkOutDate,
      price: maxPrice,
      typeRoomId: this.roomTypeId == '' ? 0 : this.roomTypeId,
      star: this.selectedRating,
      peopleNumber: this.peopleNumber == '' ? 0 : this.peopleNumber,
    };

    // Hiển thị thông báo loading
    const roomListContainer = document.querySelector('.shop-grid-contents');
    if (roomListContainer) {
      roomListContainer.classList.add('loading');
    }

    this.http
      .post<Room[]>(environment.BASE_URL_API + `/user/room/get-all-by`, payLoad)
      .subscribe(
        (res) => {
          // Lọc thêm theo giá tối thiểu (vì API chỉ hỗ trợ lọc theo giá tối đa)
          if (minPrice > 0) {
            // Lọc phòng có giá hiện tại hoặc giá khuyến mãi (nếu có) lớn hơn hoặc bằng giá tối thiểu
            this.filteredRooms = this.calculateDiscounts(res.filter(room => {
              // Nếu có giá khuyến mãi và giá đó lớn hơn hoặc bằng giá tối thiểu
              if (room.discountPrice && room.discountPrice > 0) {
                return room.discountPrice >= minPrice;
              }
              // Ngược lại kiểm tra giá hiện tại
              return room.currentPrice >= minPrice;
            }));
          } else {
            this.filteredRooms = this.calculateDiscounts(res);
          }
          
          // Cập nhật UI sau khi lọc
          if (roomListContainer) {
            roomListContainer.classList.remove('loading');
          }
          
          // Hiển thị thông báo nếu không có kết quả
          if (this.filteredRooms.length === 0) {
            this.toast.info('Không tìm thấy phòng phù hợp với khoảng giá này');
          }
        },
        (_err) => {
          this.toast.error(_err.message);
          
          // Xóa loading state
          if (roomListContainer) {
            roomListContainer.classList.remove('loading');
          }
        }
      );
  }

  /**
   * Áp dụng lọc theo đánh giá
   */
  applyRatingFilter(event: MouseEvent, rating: number) {
    // Xóa class active cũ
    const ratingItems = document.querySelectorAll('.rating-item');
    ratingItems.forEach(item => item.classList.remove('active'));
    
    // Thêm class active cho item được chọn
    const clickedItem = (event.currentTarget as HTMLElement);
    if (clickedItem) {
      if (this.selectedRating === rating) {
        // Nếu đã chọn rồi thì bỏ chọn
        this.selectedRating = 0;
        this.toast.info('Đã bỏ lọc theo đánh giá');
      } else {
        clickedItem.classList.add('active');
        this.selectedRating = rating;
        
        // Hiển thị toast thông báo
        let ratingText = "";
        switch (rating) {
          case 5: ratingText = "Tuyệt vời"; break;
          case 4: ratingText = "Rất tốt"; break;
          case 3: ratingText = "Tốt"; break;
          case 2: ratingText = "Trung bình"; break;
          case 1: ratingText = "Kém"; break;
        }
        this.toast.info(`Đã lọc theo đánh giá ${ratingText} (${rating} sao)`);
      }
    }
    
    // Áp dụng bộ lọc
    this.filterRoomsByRating(this.selectedRating);
  }

  /**
   * Lọc phòng theo đánh giá
   */
  filterRoomsByRating(rating: number) {
    var payLoad = {
      checkIn: this.checkInDate,
      checkOut: this.checkOutDate,
      price: this.maxPrice,
      typeRoomId: this.roomTypeId == '' ? 0 : this.roomTypeId,
      star: rating,
      peopleNumber: this.peopleNumber == '' ? 0 : this.peopleNumber,
    };

    this.http
      .post<Room[]>(environment.BASE_URL_API + `/user/room/get-all-by`, payLoad)
      .subscribe(
        (res) => {
          this.filteredRooms = this.calculateDiscounts(res);
        },
        (_err) => {
          this.toast.error(_err.message);
        }
      );
  }

  /**
   * Lọc phòng theo tiện nghi
   */
  filterRoomsByAmenities() {
    // Nếu không có tiện nghi nào được chọn, lấy tất cả phòng
    if (this.selectedAmenities.length === 0) {
      this.getRoomSearch();
      return;
    }
    
    // Hiển thị thông báo loading
    const roomListContainer = document.querySelector('.shop-grid-contents');
    if (roomListContainer) {
      roomListContainer.classList.add('loading');
    }
    
    // Lấy danh sách phòng từ API với các tiêu chí khác
    var payLoad = {
      checkIn: this.checkInDate,
      checkOut: this.checkOutDate,
      price: this.maxPrice,
      typeRoomId: this.roomTypeId == '' ? 0 : this.roomTypeId,
      star: this.selectedRating,
      peopleNumber: this.peopleNumber == '' ? 0 : this.peopleNumber,
    };
    
    this.http
      .post<Room[]>(environment.BASE_URL_API + `/user/room/get-all-by`, payLoad)
      .subscribe(
        (res) => {
          // Lọc kết quả dựa trên các tiện nghi đã chọn
          this.filteredRooms = this.calculateDiscounts(res.filter(room => {
            // Kiểm tra xem phòng có tất cả các tiện nghi đã chọn hay không
            if (!room.serviceAttachs || room.serviceAttachs.length === 0) {
              return false;
            }
            
            // Kiểm tra từng tiện nghi được chọn
            return this.selectedAmenities.every(amenityName => {
              return room.serviceAttachs.some(service => 
                service.name.toLowerCase().includes(amenityName.toLowerCase())
              );
            });
          }));
          
          // Cập nhật UI sau khi lọc
          if (roomListContainer) {
            roomListContainer.classList.remove('loading');
          }
          
          // Hiển thị thông báo nếu không có kết quả
          if (this.filteredRooms.length === 0) {
            this.toast.info('Không tìm thấy phòng phù hợp với các tiện nghi đã chọn');
          }
        },
        (_err) => {
          this.toast.error(_err.message);
          
          // Xóa loading state
          if (roomListContainer) {
            roomListContainer.classList.remove('loading');
          }
        }
      );
  }

  /**
   * Xử lý sự kiện khi người dùng chọn hoặc bỏ chọn tiện nghi
   */
  onAmenityCheckboxChange(event: Event, amenityName: string) {
    const checkbox = event.target as HTMLInputElement;
    
    if (checkbox.checked) {
      // Thêm vào danh sách tiện nghi đã chọn nếu chưa có
      if (!this.selectedAmenities.includes(amenityName)) {
        this.selectedAmenities.push(amenityName);
        this.toast.info(`Đã thêm tiện nghi "${amenityName}" vào bộ lọc`);
      }
    } else {
      // Xóa khỏi danh sách tiện nghi đã chọn
      const index = this.selectedAmenities.indexOf(amenityName);
      if (index > -1) {
        this.selectedAmenities.splice(index, 1);
        this.toast.info(`Đã xóa tiện nghi "${amenityName}" khỏi bộ lọc`);
      }
    }
  }
}
