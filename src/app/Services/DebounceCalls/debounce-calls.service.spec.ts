import { TestBed } from '@angular/core/testing';

import { DebounceCallsService } from './debounce-calls.service';

describe('DebounceCallsService', () => {
  let service: DebounceCallsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DebounceCallsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
