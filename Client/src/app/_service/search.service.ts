import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { Room, Roomsearch } from '../models/room.model';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  public filteredRoomsSubject = new BehaviorSubject<Room[]>([]);
  filteredRooms = this.filteredRoomsSubject.asObservable();

  private apiRooms =
    environment.BASE_URL_API + '/user/room/get-all';
  constructor(private http: HttpClient) {}

  private searchResults: Room[] = [];

  setSearchResults(results: Room[]) {
    this.searchResults = results;
  }

  getSearchResults(): Room[] {
    return this.searchResults;
  }
}
