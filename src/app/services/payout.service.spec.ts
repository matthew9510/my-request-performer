import { TestBed } from '@angular/core/testing';

import { PayoutService } from './payout.service';

describe('PayoutService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PayoutService = TestBed.get(PayoutService);
    expect(service).toBeTruthy();
  });
});
