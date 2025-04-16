import { Component, OnInit } from '@angular/core';
import { Room } from '../models/room.model';
import { ApiService } from '../_service/api.service';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { SearchService } from '../_service/search.service';
import { Observable } from 'rxjs';

const today = new Date();
const month = today.getMonth();
const year = today.getFullYear();
interface RoomType {
  id: number;
  typeName: string;
  maxPerson: number;

}


@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.scss']
})
export class SearchResultComponent implements OnInit{
  filteredRooms!: Observable<Room[]>;
  searchResults!: Room[];
  page: number = 1;
  rooms: Room[] = [];
  count: number = 0;
  tableSize: number = 7;
  tableSizes: any = [3, 6, 9, 12];
  constructor( private roomService: ApiService,
    private router: Router,
    private api: ApiService,
    private search: SearchService){

  }
  ngOnInit(): void {

    this.api.getRooms().subscribe(
      (rooms: Room[]) => {
        this.rooms = rooms;
        this.searchResults = rooms;
      },
      (error: any) => {
        console.log(error);
      }
    );
  }

  getRooms(){
    this.roomService.getRooms().subscribe((res: any)=>{
      this.filteredRooms = res;
    })
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
}
