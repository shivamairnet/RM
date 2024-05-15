import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnqRoundComponent } from './enq-round.component';

describe('EnqRoundComponent', () => {
  let component: EnqRoundComponent;
  let fixture: ComponentFixture<EnqRoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnqRoundComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnqRoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
