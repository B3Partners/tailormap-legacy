import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CriteriaDescriptionComponent } from './criteria-description.component';

describe('CriteriaDescriptionComponent', () => {
  let component: CriteriaDescriptionComponent;
  let fixture: ComponentFixture<CriteriaDescriptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CriteriaDescriptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CriteriaDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
