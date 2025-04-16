import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeftContentComponent } from './left-content.component';

describe('LeftContentComponent', () => {
  let component: LeftContentComponent;
  let fixture: ComponentFixture<LeftContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeftContentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeftContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
