import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateLayerLayerSelectionComponent } from './create-layer-layer-selection.component';

describe('CreateLayerLayerSelectionComponent', () => {
  let component: CreateLayerLayerSelectionComponent;
  let fixture: ComponentFixture<CreateLayerLayerSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateLayerLayerSelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateLayerLayerSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
