import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CriteriaGroupComponent } from './criteria-group.component';

describe('CriteriaGroupComponent', () => {
  let component: CriteriaGroupComponent;
  let fixture: ComponentFixture<CriteriaGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CriteriaGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CriteriaGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
