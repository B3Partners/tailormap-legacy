import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributeListFilterComponent } from './attribute-list-filter.component';

describe('AttributeListFilterComponent', () => {
  let component: AttributeListFilterComponent;
  let fixture: ComponentFixture<AttributeListFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttributeListFilterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AttributeListFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
