import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFeatureMenuComponent } from './add-feature-menu.component';

describe('AddFeatureMenuComponent', () => {
  let component: AddFeatureMenuComponent;
  let fixture: ComponentFixture<AddFeatureMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddFeatureMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddFeatureMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
