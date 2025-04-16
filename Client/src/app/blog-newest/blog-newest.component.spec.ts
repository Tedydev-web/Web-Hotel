import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogNewestComponent } from './blog-newest.component';

describe('BlogNewestComponent', () => {
  let component: BlogNewestComponent;
  let fixture: ComponentFixture<BlogNewestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlogNewestComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogNewestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
