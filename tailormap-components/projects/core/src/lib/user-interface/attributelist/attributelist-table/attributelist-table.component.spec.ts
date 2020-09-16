import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributelistTableComponent } from './attributelist-table.component';

describe('AttributelistTable2Component', () => {
  let component: AttributelistTableComponent;
  let fixture: ComponentFixture<AttributelistTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttributelistTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttributelistTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
