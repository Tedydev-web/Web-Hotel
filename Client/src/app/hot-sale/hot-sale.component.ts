import { Component, OnInit } from '@angular/core';
import { ApiService } from '../_service/api.service';
import { Room } from '../models/room.model';
@Component({
  selector: 'app-hot-sale',
  templateUrl: './hot-sale.component.html',
  styleUrls: ['./hot-sale.component.scss']
})
export class HotSaleComponent implements OnInit{
  discountRoom!: Room[];
  isAnimating: boolean = false;
  slideAnimation: string = '';
  currentIndex: number = 0;
  startIndex: number = 0;
  endIndex: number = 1;
  roomId!: string;
  constructor(
    private api: ApiService
  ){

  }




  ngOnInit(): void {
    this.api.getRoomOnSale().subscribe(
      (rooms: Room[]) => {
        this.discountRoom = rooms;
      },
      (error: any) => {
        console.log(error);
      }
    );

  }
  nextProduct(): void {
    if (this.isAnimating) {
      return;
    }

    this.currentIndex++;
    if (this.currentIndex > this.endIndex) {
      this.startIndex++;
      this.endIndex++;
    }

    // Kiểm tra và giới hạn giá trị hiển thị
    if (this.endIndex >= this.discountRoom.length) {
      this.endIndex = this.discountRoom.length - 1;
      this.startIndex = this.endIndex - 1;
    }

    this.slideAnimation = 'slide-next';
    this.isAnimating = true;

    setTimeout(() => {
      this.slideAnimation = '';
      this.isAnimating = false;
    }, 500);
  }

  previousProduct(): void {
    if (this.isAnimating) {
      return;
    }

    this.currentIndex--;
    if (this.currentIndex < this.startIndex) {
      this.startIndex--;
      this.endIndex--;
    }

    // Kiểm tra và giới hạn giá trị hiển thị
    if (this.startIndex < 0) {
      this.startIndex = 0;
      this.endIndex = this.startIndex + 1;
    }

    this.slideAnimation = 'slide-previous';
    this.isAnimating = true;

    setTimeout(() => {
      this.slideAnimation = '';
      this.isAnimating = false;
    }, 500);
  }
  getRoomId(id: string){
    const idtemp = id
  }
}
