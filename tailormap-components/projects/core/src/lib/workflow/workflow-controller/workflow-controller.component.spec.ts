import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowControllerComponent } from './workflow-controller.component';

describe('WorkflowControllerComponent', () => {
  let component: WorkflowControllerComponent;
  let fixture: ComponentFixture<WorkflowControllerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkflowControllerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
