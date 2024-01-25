import { TestBed } from '@angular/core/testing';

import { MessageSnackbarService } from './message-snackbar.service';

describe('MessageSnackbarService', () => {
  let service: MessageSnackbarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MessageSnackbarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
