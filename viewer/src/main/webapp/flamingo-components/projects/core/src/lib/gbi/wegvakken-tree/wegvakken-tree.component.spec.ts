import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WegvakkenTreeComponent } from './wegvakken-tree.component';

describe('WegvakkenTreeComponent', () => {
  let component: WegvakkenTreeComponent;
  let fixture: ComponentFixture<WegvakkenTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WegvakkenTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WegvakkenTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
