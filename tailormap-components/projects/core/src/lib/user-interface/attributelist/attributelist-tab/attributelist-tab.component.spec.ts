import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributelistTabComponent } from './attributelist-tab.component';

describe('AttrlistTabComponent', () => {
  let component: AttributelistTabComponent;
  let fixture: ComponentFixture<AttributelistTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttributelistTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttributelistTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
