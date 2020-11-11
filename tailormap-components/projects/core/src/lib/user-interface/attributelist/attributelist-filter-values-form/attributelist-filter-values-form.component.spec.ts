import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributelistFilterValuesFormComponent } from './attributelist-filter-values-form.component';

describe('AttributelistFilterValuesFormComponent', () => {
  let component: AttributelistFilterValuesFormComponent;
  let fixture: ComponentFixture<AttributelistFilterValuesFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttributelistFilterValuesFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttributelistFilterValuesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
