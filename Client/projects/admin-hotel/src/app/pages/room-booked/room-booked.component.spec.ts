import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomBookedComponent } from './room-booked.component';

describe('RoomBookedComponent', () => {
  let component: RoomBookedComponent;
  let fixture: ComponentFixture<RoomBookedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoomBookedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomBookedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
