import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnqMultiwayComponent } from './enq-multiway.component';

describe('EnqMultiwayComponent', () => {
  let component: EnqMultiwayComponent;
  let fixture: ComponentFixture<EnqMultiwayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnqMultiwayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnqMultiwayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
