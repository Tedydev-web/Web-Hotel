import { Component, OnInit } from '@angular/core';
import { ApiService } from '../_service/api.service';
import { Blog } from '../models/blog.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogService } from '../_service/blog.service';

@Component({
  selector: 'app-blog-newest',
  templateUrl: './blog-newest.component.html',
  styleUrls: ['./blog-newest.component.scss']
})
export class BlogNewestComponent implements OnInit{
  blogtoDisplay!: Blog[];

  blogs$: Observable<any> | undefined;
  blogentry!: string;
  constructor(private route: ActivatedRoute, private blogs: BlogService, private router: Router){}

  ngOnInit(): void {
    this.getBlogs();
  }
  getBlogs(){
    this.blogs$ = this.blogs.getAllEntries()
  }
  navigateToPage(url: string) {
    window.location.href = url;
    window.scrollTo(0, 0);
  }
  removeBlogsPrefix(id: string): string {
    return id.replace(/^blogs\//, '');
  }
}
