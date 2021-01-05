import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StyleFormPanelComponent } from './style-form-panel.component';

describe('StyleFormPanelComponent', () => {
  let component: StyleFormPanelComponent;
  let fixture: ComponentFixture<StyleFormPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StyleFormPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StyleFormPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
