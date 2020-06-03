import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormPopupComponent } from './form-popup.component';

describe('WegvakPopupComponent', () => {
  let component: FormPopupComponent;
  let fixture: ComponentFixture<FormPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
