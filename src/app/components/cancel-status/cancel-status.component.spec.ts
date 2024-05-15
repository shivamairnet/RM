import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelStatusComponent } from './cancel-status.component';

describe('CancelStatusComponent', () => {
  let component: CancelStatusComponent;
  let fixture: ComponentFixture<CancelStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CancelStatusComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CancelStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
