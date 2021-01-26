import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelResizerComponent } from './panel-resizer.component';

describe('ResizeHandleComponent', () => {
  let component: PanelResizerComponent;
  let fixture: ComponentFixture<PanelResizerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelResizerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelResizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
