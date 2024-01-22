// src/app/services/socket.service.spec.ts

import { TestBed } from '@angular/core/testing';
import { SocketService } from './socket.service';
import * as io from 'socket.io-client';

describe('SocketService', () => {
  let service: SocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Add more tests as necessary
});
