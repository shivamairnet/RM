import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnqOnewayComponent } from './enq-oneway.component';

describe('EnqOnewayComponent', () => {
  let component: EnqOnewayComponent;
  let fixture: ComponentFixture<EnqOnewayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnqOnewayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnqOnewayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
