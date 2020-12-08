import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationTreeNodeComponent } from './application-tree-node.component';

describe('ApplicationTreeNodeComponent', () => {
  let component: ApplicationTreeNodeComponent;
  let fixture: ComponentFixture<ApplicationTreeNodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationTreeNodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationTreeNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
