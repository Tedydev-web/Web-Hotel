import { Component, OnInit } from '@angular/core';
import { Blog } from '../models/blog.model';
import { ApiService } from '../_service/api.service';
import { BlogService } from '../_service/blog.service';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment.development';
import { createClient } from 'contentful';

@Component({
  selector: 'app-blogs',
  templateUrl: './blogs.component.html',
  styleUrls: ['./blogs.component.scss']
})
export class BlogsComponent implements OnInit {
  private client = createClient({
    space: environment.spaceId,
    accessToken: environment.accessToken
  });
  blogs$: Observable<any> | undefined;
  blogentry!: string;
  constructor(private route: ActivatedRoute, private blogs: BlogService, private router: Router){}

  ngOnInit(): void {
    this.getBlogs();
  }
  getBlogs(){
    this.blogs$ = this.blogs.getAllEntries()
  }
  removeBlogsPrefix(id: string): string {
    return id.replace(/^blogs\//, '');
  }
}
