import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormAttributeListButtonComponent } from './form-attribute-list-button.component';

describe('FormAttributeListButtonComponent', () => {
  let component: FormAttributeListButtonComponent;
  let fixture: ComponentFixture<FormAttributeListButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormAttributeListButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormAttributeListButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
