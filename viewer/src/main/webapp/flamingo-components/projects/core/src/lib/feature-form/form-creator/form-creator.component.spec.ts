import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCreatorComponent } from './form-creator.component';

describe('WegvakkenFormCreatorComponent', () => {
  let component: FormCreatorComponent;
  let fixture: ComponentFixture<FormCreatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormCreatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
