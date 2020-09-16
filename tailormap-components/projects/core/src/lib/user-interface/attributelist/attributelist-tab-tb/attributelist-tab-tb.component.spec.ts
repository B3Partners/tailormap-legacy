import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributelistTabTbComponent } from './attributelist-tab-tb.component';

describe('AttrlistTabTbComponent', () => {
  let component: AttributelistTabTbComponent;
  let fixture: ComponentFixture<AttributelistTabTbComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttributelistTabTbComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttributelistTabTbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
