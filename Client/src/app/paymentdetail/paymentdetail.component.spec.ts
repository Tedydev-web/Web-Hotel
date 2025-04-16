import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentdetailComponent } from './paymentdetail.component';

describe('PaymentdetailComponent', () => {
  let component: PaymentdetailComponent;
  let fixture: ComponentFixture<PaymentdetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentdetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentdetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
