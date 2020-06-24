import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormComponent } from './form.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {SharedModule} from "../../shared/shared.module";
import {FormCreatorComponent} from "../form-creator/form-creator.component";
import {AddFeatureComponent} from "../../user-interface/add-feature/add-feature.component";
import {FormPopupComponent} from "../form-popup/form-popup.component";
import {FormTreeComponent} from "../form-tree/form-tree.component";
import {FormfieldComponent} from "../form-field/formfield.component";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FeatureControllerService} from "../../shared/generated";
import {FormconfigRepositoryService} from "../../shared/formconfig-repository/formconfig-repository.service";

fdescribe('WegvakkenFormComponent', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;

  const mockDialogRef = {
    close: jasmine.createSpy('close'),
  };

  const featureRepoSpy = {
    getAllFormConfigs: function(){
      return {config: {}};
    },
    getFormConfig: function(){
    return {fields: []};
    }
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports:[
        FormsModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        SharedModule,
      ],
      declarations: [

        FormCreatorComponent,
        AddFeatureComponent,
        FormPopupComponent,
        FormTreeComponent,
        FormfieldComponent,
        FormCreatorComponent,
        FormComponent ],
      providers:[
        FeatureControllerService,
        {
          provide: FormconfigRepositoryService,
          useValue: featureRepoSpy,
        },
        { provide: MatDialogRef, useValue: mockDialogRef },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            formFeatures:[{clazz:'testFeature'}],
            isBulk: false,
            lookup: {}
          },
        },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
