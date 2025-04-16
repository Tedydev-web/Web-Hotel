import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomservicesComponent } from './roomservices.component';

describe('RoomservicesComponent', () => {
  let component: RoomservicesComponent;
  let fixture: ComponentFixture<RoomservicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoomservicesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomservicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
