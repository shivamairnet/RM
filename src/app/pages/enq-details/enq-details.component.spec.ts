import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnqDetailsComponent } from './enq-details.component';

describe('EnqDetailsComponent', () => {
  let component: EnqDetailsComponent;
  let fixture: ComponentFixture<EnqDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnqDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnqDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
