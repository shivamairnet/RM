import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotRegiteredComponent } from './not-regitered.component';

describe('NotRegiteredComponent', () => {
  let component: NotRegiteredComponent;
  let fixture: ComponentFixture<NotRegiteredComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotRegiteredComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotRegiteredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
