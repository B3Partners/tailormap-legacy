import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateLayerFormComponent } from './create-layer-form.component';

describe('CreateLayerFormComponent', () => {
  let component: CreateLayerFormComponent;
  let fixture: ComponentFixture<CreateLayerFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateLayerFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateLayerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
