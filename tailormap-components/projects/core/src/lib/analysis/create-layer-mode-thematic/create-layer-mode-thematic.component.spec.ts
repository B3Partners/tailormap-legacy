import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateLayerModeThematicComponent } from './create-layer-mode-thematic.component';

describe('CreateLayerModeThematicComponent', () => {
  let component: CreateLayerModeThematicComponent;
  let fixture: ComponentFixture<CreateLayerModeThematicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateLayerModeThematicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateLayerModeThematicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
