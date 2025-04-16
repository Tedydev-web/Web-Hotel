import { Component, OnInit } from '@angular/core';
import { BlogService } from 'src/app/_service/blog.service';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment.development';
import { createClient } from 'contentful';
@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent implements OnInit{
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

}
