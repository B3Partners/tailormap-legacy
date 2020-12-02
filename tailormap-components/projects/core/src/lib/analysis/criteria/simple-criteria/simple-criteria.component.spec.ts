import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleCriteriaComponent } from './simple-criteria.component';

describe('SimpleCriteriaComponent', () => {
  let component: SimpleCriteriaComponent;
  let fixture: ComponentFixture<SimpleCriteriaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SimpleCriteriaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleCriteriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
