import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributelistPanelComponent } from './attributelist-panel.component';

describe('AttrlistPanelComponent', () => {
  let component: AttributelistPanelComponent;
  let fixture: ComponentFixture<AttributelistPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttributelistPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttributelistPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
