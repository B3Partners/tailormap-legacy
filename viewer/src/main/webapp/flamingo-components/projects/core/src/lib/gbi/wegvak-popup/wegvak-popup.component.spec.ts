import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WegvakPopupComponent } from './wegvak-popup.component';

describe('WegvakPopupComponent', () => {
  let component: WegvakPopupComponent;
  let fixture: ComponentFixture<WegvakPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WegvakPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WegvakPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
