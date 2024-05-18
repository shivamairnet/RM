import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnqItenaryComponent } from './enq-itinerary.component';

describe('EnqItenaryComponent', () => {
  let component: EnqItenaryComponent;
  let fixture: ComponentFixture<EnqItenaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnqItenaryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnqItenaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
