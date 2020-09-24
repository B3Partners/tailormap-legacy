import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyCreatorComponent } from './copy-creator.component';

describe('CopyCreatorComponent', () => {
  let component: CopyCreatorComponent;
  let fixture: ComponentFixture<CopyCreatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CopyCreatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
