import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormfieldComponent } from './formfield.component';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { FormFieldType } from '../form/form-models';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { formStateKey, initialFormState } from '../state/form.state';
import { getFormConfigsMocks, mockFeature } from '../../shared/tests/test-data';
import { LabelFieldComponent } from '../../user-interface/generic-components/label-field/label-field.component';
import { applicationStateKey, initialApplicationState } from '../../application/state/application.state';

describe('FormfieldComponent', () => {
  let component: FormfieldComponent;
  let fixture: ComponentFixture<FormfieldComponent>;

  const initialState = {
    [formStateKey]: {
      ...initialFormState,
      feature: mockFeature(),
      formConfigs: getFormConfigsMocks(),
    },
    [applicationStateKey]: initialApplicationState,
  };


  let store: MockStore;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
      ],
      declarations: [ FormfieldComponent, LabelFieldComponent ],
      providers: [
        provideMockStore({ initialState }),
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormfieldComponent);
    component = fixture.componentInstance;
    component.attribute = {column: 0, key: 'tak', tab: 0, type: FormFieldType.TEXTFIELD, value: ''};
    const controls = {};
    controls[component.attribute.key] = new FormControl(component.attribute.value);
    component.groep = new FormGroup(controls);
    store = TestBed.inject(MockStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
