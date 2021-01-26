import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormTreeComponent } from './form-tree.component';
import {SharedModule} from "../../shared/shared.module";
import { FormConfigMockModule } from '../../shared/formconfig-repository/formconfig-mock.module.spec';

describe('FormTreeComponent', () => {
  let component: FormTreeComponent;
  let fixture: ComponentFixture<FormTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        FormConfigMockModule,
      ],
      providers:[],
      declarations: [ FormTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
