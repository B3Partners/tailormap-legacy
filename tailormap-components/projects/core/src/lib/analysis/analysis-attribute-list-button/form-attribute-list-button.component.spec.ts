import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalysisAttributeListButtonComponent } from './analysis-attribute-list-button.component';

describe('FormAttributeListButtonComponent', () => {
  let component: AnalysisAttributeListButtonComponent;
  let fixture: ComponentFixture<AnalysisAttributeListButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnalysisAttributeListButtonComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalysisAttributeListButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
