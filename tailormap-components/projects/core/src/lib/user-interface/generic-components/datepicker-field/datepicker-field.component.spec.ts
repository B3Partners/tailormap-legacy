import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatepickerFieldComponent } from './datepicker-field.component';

describe('DatepickerFieldComponent', () => {
  let component: DatepickerFieldComponent;
  let fixture: ComponentFixture<DatepickerFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatepickerFieldComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DatepickerFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
