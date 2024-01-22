// src/app/components/play/play.component.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayComponent } from './play.component';
import { SocketService } from '../../services/socket.service';

describe('PlayComponent', () => {
  let component: PlayComponent;
  let fixture: ComponentFixture<PlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayComponent ],
      providers: [ SocketService ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
