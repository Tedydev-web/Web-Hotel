import { Injectable } from '@angular/core';
import {createClient, Entry} from 'contentful';
import { from } from 'rxjs';
import { environment } from 'src/environments/environment.development';
@Injectable({
  providedIn: 'root'
})
export class BlogService {
  constructor() { }

  private client = createClient({
    space: environment.spaceId,
    accessToken: environment.accessToken
  });

  getAllEntries(){
   const promise =  this.client.getEntries();
    console.log(promise);

   return from(promise)
  }

  getEntryById(id: string){
    const promise =  this.client.getEntry(id);
    return from(promise)
  }

}
