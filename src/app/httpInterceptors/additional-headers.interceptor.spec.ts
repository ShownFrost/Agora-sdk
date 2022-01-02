import { TestBed } from '@angular/core/testing';

import { AdditionalHeadersInterceptor } from './additional-headers.interceptor';

describe('AdditionalHeadersInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      AdditionalHeadersInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: AdditionalHeadersInterceptor = TestBed.inject(AdditionalHeadersInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
