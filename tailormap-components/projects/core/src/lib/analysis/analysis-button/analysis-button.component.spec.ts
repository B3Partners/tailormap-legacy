import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalysisButtonComponent } from './analysis-button.component';

describe('AnalysisButtonComponent', () => {
  let component: AnalysisButtonComponent;
  let fixture: ComponentFixture<AnalysisButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnalysisButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalysisButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
