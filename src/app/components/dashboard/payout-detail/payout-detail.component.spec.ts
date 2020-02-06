import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayoutDetailComponent } from './payout-detail.component';

describe('PayoutDetailComponent', () => {
  let component: PayoutDetailComponent;
  let fixture: ComponentFixture<PayoutDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayoutDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayoutDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
