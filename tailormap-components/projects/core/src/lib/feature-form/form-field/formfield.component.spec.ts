import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormfieldComponent } from './formfield.component';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { FormFieldType } from '../form/form-models';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { formStateKey, initialFormState } from '../state/form.state';
import { getFormConfigsMocks, mockBoom } from '../../shared/tests/test-data';

describe('FormfieldComponent', () => {
  let component: FormfieldComponent;
  let fixture: ComponentFixture<FormfieldComponent>;

  const initialState = {
    [formStateKey]: {
      ...initialFormState,
      feature: mockBoom(),
      formConfigs: getFormConfigsMocks(),
    },
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
      declarations: [ FormfieldComponent ],
      providers: [
        provideMockStore({ initialState }),
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormfieldComponent);
    component = fixture.componentInstance;
    component.attribute = {column: 0, key: "tak", tab: 0, type: FormFieldType.TEXTFIELD, value: ""};
    let controls = {};
    controls[component.attribute.key] = new FormControl(component.attribute.value);
    component.groep = new FormGroup(controls);
    store = TestBed.inject(MockStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
