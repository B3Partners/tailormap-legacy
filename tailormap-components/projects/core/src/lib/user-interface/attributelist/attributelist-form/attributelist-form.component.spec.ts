import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributelistFormComponent } from './attributelist-form.component';

describe('AttributelistFormComponent', () => {
  let component: AttributelistFormComponent;
  let fixture: ComponentFixture<AttributelistFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttributelistFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttributelistFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
