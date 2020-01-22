import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WegvakkenFormComponent } from './wegvakken-form.component';

describe('WegvakkenFormComponent', () => {
  let component: WegvakkenFormComponent;
  let fixture: ComponentFixture<WegvakkenFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WegvakkenFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WegvakkenFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
