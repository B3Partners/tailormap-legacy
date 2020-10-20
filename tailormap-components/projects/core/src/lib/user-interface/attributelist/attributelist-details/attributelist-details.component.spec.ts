import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributelistDetailsComponent } from './attributelist-details.component';

describe('AttributelistDetailsComponent', () => {
  let component: AttributelistDetailsComponent;
  let fixture: ComponentFixture<AttributelistDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttributelistDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttributelistDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
