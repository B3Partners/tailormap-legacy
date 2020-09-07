import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestAttributeserviceComponent } from './test-attributeservice.component';

describe('TestAttributeserviceComponent', () => {
  let component: TestAttributeserviceComponent;
  let fixture: ComponentFixture<TestAttributeserviceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestAttributeserviceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestAttributeserviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
