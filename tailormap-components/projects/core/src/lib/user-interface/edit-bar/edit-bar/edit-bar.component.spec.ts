import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBarComponent } from './edit-bar.component';

describe('EditBarComponent', () => {
  let component: EditBarComponent;
  let fixture: ComponentFixture<EditBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
