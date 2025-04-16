import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LayoutpageComponent } from './layoutpage.component';

describe('LayoutpageComponent', () => {
  let component: LayoutpageComponent;
  let fixture: ComponentFixture<LayoutpageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LayoutpageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
