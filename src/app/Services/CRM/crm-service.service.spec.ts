import { TestBed } from '@angular/core/testing';

import { CrmServiceService } from './crm-service.service';

describe('CrmServiceService', () => {
  let service: CrmServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CrmServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
