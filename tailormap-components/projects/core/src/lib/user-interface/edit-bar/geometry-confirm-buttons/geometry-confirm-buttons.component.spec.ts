import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeometryConfirmButtonsComponent } from './geometry-confirm-buttons.component';

describe('GeometryConfirmButtonsComponent', () => {
  let component: GeometryConfirmButtonsComponent;
  let fixture: ComponentFixture<GeometryConfirmButtonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeometryConfirmButtonsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeometryConfirmButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
