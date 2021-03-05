import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormTreeComponent } from './form-tree.component';
import {SharedModule} from "../../shared/shared.module";
import { FormConfigMockModule } from '../../shared/formconfig-repository/formconfig-mock.module.spec';
import { formStateKey, initialFormState } from '../state/form.state';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { applicationStateKey, initialApplicationState } from '../../application/state/application.state';

describe('FormTreeComponent', () => {
  let component: FormTreeComponent;
  let fixture: ComponentFixture<FormTreeComponent>;
  const initialState = {
    [formStateKey]: initialFormState,
    [applicationStateKey]: initialApplicationState,
  };
  let store: MockStore;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        FormConfigMockModule,
      ],
      providers:[
        provideMockStore({ initialState }),],
      declarations: [ FormTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormTreeComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
