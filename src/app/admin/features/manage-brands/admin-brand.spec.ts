import { TestBed } from '@angular/core/testing';

import { AdminBrand } from './admin-brand';

describe('AdminBrand', () => {
  let service: AdminBrand;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminBrand);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
