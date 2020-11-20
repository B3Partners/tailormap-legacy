import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateLayerStylingComponent } from './create-layer-styling.component';

describe('CreateLayerStylingComponent', () => {
  let component: CreateLayerStylingComponent;
  let fixture: ComponentFixture<CreateLayerStylingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateLayerStylingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateLayerStylingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
