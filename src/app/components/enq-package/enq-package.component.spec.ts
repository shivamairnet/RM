import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnqPackageComponent } from './enq-package.component';

describe('EnqPackageComponent', () => {
  let component: EnqPackageComponent;
  let fixture: ComponentFixture<EnqPackageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnqPackageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnqPackageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
