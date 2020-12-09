import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedCriteriaComponent } from './advanced-criteria.component';

describe('AdvancedCriteriaComponent', () => {
  let component: AdvancedCriteriaComponent;
  let fixture: ComponentFixture<AdvancedCriteriaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdvancedCriteriaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvancedCriteriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
