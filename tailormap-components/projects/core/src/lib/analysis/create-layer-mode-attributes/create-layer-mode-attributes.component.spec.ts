import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateLayerModeAttributesComponent } from './create-layer-mode-attributes.component';

describe('CreateLayerThematicComponent', () => {
  let component: CreateLayerModeAttributesComponent;
  let fixture: ComponentFixture<CreateLayerModeAttributesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateLayerModeAttributesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateLayerModeAttributesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
