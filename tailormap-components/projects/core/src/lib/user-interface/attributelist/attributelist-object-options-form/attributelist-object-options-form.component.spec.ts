
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributelistObjectOptionsFormComponent } from './attributelist-object-options-form.component';

describe('AttributelistObjectOptionsFormComponent', () => {
  let component: AttributelistObjectOptionsFormComponent;
  let fixture: ComponentFixture<AttributelistObjectOptionsFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttributelistObjectOptionsFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttributelistObjectOptionsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
