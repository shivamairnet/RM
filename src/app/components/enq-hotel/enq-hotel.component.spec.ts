import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnqHotelComponent } from './enq-hotel.component';

describe('EnqHotelComponent', () => {
  let component: EnqHotelComponent;
  let fixture: ComponentFixture<EnqHotelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnqHotelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnqHotelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
