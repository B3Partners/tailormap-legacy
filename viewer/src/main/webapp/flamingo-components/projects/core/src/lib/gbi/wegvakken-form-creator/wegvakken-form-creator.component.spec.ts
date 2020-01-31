import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WegvakkenFormCreatorComponent } from './wegvakken-form-creator.component';

describe('WegvakkenFormCreatorComponent', () => {
  let component: WegvakkenFormCreatorComponent;
  let fixture: ComponentFixture<WegvakkenFormCreatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WegvakkenFormCreatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WegvakkenFormCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
