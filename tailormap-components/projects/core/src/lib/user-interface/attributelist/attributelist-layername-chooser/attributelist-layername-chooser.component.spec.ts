import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributelistLayernameChooserComponent } from './attributelist-layername-chooser.component';

describe('AttributelistLayernameChooserComponent', () => {
  let component: AttributelistLayernameChooserComponent;
  let fixture: ComponentFixture<AttributelistLayernameChooserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttributelistLayernameChooserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttributelistLayernameChooserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
