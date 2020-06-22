import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFeatureComponent } from './add-feature.component';

describe('AddFeatureComponent', () => {
  let component: AddFeatureComponent;
  let fixture: ComponentFixture<AddFeatureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddFeatureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
