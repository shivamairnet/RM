import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TraceIdTimerComponent } from './trace-id-timer.component';

describe('TraceIdTimerComponent', () => {
  let component: TraceIdTimerComponent;
  let fixture: ComponentFixture<TraceIdTimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TraceIdTimerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TraceIdTimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
