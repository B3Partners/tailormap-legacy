import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateLayerPanelComponent } from './create-layer-panel.component';

describe('CreateLayerPanelComponent', () => {
  let component: CreateLayerPanelComponent;
  let fixture: ComponentFixture<CreateLayerPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateLayerPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateLayerPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
