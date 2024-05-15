import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnqFlightComponent } from './enq-flight.component';

describe('EnqFlightComponent', () => {
  let component: EnqFlightComponent;
  let fixture: ComponentFixture<EnqFlightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnqFlightComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnqFlightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
