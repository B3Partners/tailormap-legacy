
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributelistTableOptionsFormComponent } from './attributelist-table-options-form.component';

describe('AttributelistTableOptionsFormComponent', () => {
  let component: AttributelistTableOptionsFormComponent;
  let fixture: ComponentFixture<AttributelistTableOptionsFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttributelistTableOptionsFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttributelistTableOptionsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
