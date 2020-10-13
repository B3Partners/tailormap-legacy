import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributelistTabToolbarComponent } from './attributelist-tab-toolbar.component';

describe('AttrlistTabTbComponent', () => {
  let component: AttributelistTabToolbarComponent;
  let fixture: ComponentFixture<AttributelistTabToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttributelistTabToolbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttributelistTabToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
