import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelResizerComponent } from './panel-resizer.component';
import { SharedModule } from '../../shared/shared.module';

describe('ResizeHandleComponent', () => {
  let component: PanelResizerComponent;
  let fixture: ComponentFixture<PanelResizerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelResizerComponent ],
      imports: [ SharedModule ],
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
