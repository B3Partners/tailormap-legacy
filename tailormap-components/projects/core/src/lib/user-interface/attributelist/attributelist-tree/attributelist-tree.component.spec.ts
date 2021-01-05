import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributelistTreeComponent } from './attributelist-tree.component';

describe('AttributelistTreeComponent', () => {
  let component: AttributelistTreeComponent;
  let fixture: ComponentFixture<AttributelistTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttributelistTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttributelistTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
