import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteMapsComponent } from './route-maps.component';

describe('RouteMapsComponent', () => {
  let component: RouteMapsComponent;
  let fixture: ComponentFixture<RouteMapsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RouteMapsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouteMapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
