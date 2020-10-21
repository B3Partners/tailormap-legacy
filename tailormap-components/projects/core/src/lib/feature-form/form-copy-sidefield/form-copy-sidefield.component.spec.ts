import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCopySidefieldComponent } from './form-copy-sidefield.component';

describe('FormCopySidefieldComponent', () => {
  let component: FormCopySidefieldComponent;
  let fixture: ComponentFixture<FormCopySidefieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormCopySidefieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormCopySidefieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
