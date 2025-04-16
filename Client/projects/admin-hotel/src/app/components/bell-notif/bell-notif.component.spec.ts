import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BellNotifComponent } from './bell-notif.component';

describe('BellNotifComponent', () => {
  let component: BellNotifComponent;
  let fixture: ComponentFixture<BellNotifComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BellNotifComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BellNotifComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
