import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WegvakFormfieldComponent } from './wegvak-formfield.component';

describe('WegvakFormfieldComponent', () => {
  let component: WegvakFormfieldComponent;
  let fixture: ComponentFixture<WegvakFormfieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WegvakFormfieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WegvakFormfieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
