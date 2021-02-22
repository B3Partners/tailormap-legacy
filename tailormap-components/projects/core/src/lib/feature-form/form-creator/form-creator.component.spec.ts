import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormCreatorComponent } from './form-creator.component';
import {
  Feature,
  FeatureControllerService,
  Wegvakonderdeel,
  Wegvakonderdeelplanning,
} from '../../shared/generated';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SharedModule} from "../../shared/shared.module";
import { FormConfiguration} from "../form/form-models";
import {FormfieldComponent} from "../form-field/formfield.component";
import {FormComponent} from "../form/form.component";
import {FormTreeComponent} from "../form-tree/form-tree.component";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {FeatureInitializerService} from "../../shared/feature-initializer/feature-initializer.service";
import { FormConfigMockModule } from '../../shared/formconfig-repository/formconfig-mock.module.spec';
import { mockFeature, mockWegvakonderdeel, mockWegvakonderdeelplanning } from '../../shared/tests/test-data';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { workflowStateKey, initialWorkflowState } from '../../workflow/state/workflow.state';

describe('FormCreatorComponent', () => {
  let component: FormCreatorComponent;
  let fixture: ComponentFixture<FormCreatorComponent>;

  const initialState = { [workflowStateKey]: initialWorkflowState };
  let store: MockStore;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        SharedModule,
        FormConfigMockModule,
      ],
      providers:[
        FeatureControllerService,
        provideMockStore({ initialState }),

      ],
      declarations: [
        FormComponent,
        FormTreeComponent,
        FormfieldComponent,
        FormCreatorComponent,]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormCreatorComponent);
    component = fixture.componentInstance;
    let formConfig : FormConfiguration = {
      featureType: "",
      tabConfig: undefined,
      fields: [],
      tabs: 0,
      name: 'pietje',
      treeNodeColumn:'wer'
    };
    store = TestBed.inject(MockStore);
    component.formConfig = formConfig;
    component.ngOnChanges();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
