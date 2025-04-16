import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route } from '@angular/router';
import { ApiService } from '../_service/api.service';
import { Blog } from '../models/blog.model';
import { BlogService } from '../_service/blog.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-blog-detail',
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.scss']
})
export class BlogDetailComponent implements OnInit {
  blog$: Observable<any> | undefined;
  blogDetail!: Blog;
  constructor(private route: ActivatedRoute, private blog: BlogService){}

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.route.params.subscribe( params => {
      const id = params['id'];

      this.blog$ = this.blog.getEntryById(id)

    })
  }


}
