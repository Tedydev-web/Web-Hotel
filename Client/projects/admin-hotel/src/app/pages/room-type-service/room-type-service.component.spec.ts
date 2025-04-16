import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomTypeServiceComponent } from './room-type-service.component';

describe('RoomTypeServiceComponent', () => {
  let component: RoomTypeServiceComponent;
  let fixture: ComponentFixture<RoomTypeServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoomTypeServiceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomTypeServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
