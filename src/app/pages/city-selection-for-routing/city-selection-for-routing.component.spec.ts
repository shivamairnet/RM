import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitySelectionForRoutingComponent } from './city-selection-for-routing.component';

describe('CitySelectionForRoutingComponent', () => {
  let component: CitySelectionForRoutingComponent;
  let fixture: ComponentFixture<CitySelectionForRoutingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CitySelectionForRoutingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CitySelectionForRoutingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
