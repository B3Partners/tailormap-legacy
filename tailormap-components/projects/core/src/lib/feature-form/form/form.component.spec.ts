import {
  async,
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';

import { FormComponent } from './form.component';
import {
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SharedModule } from '../../shared/shared.module';
import { FormCreatorComponent } from '../form-creator/form-creator.component';
import { AddFeatureComponent } from '../../user-interface/add-feature/add-feature.component';
import { FormTreeComponent } from '../form-tree/form-tree.component';
import { FormfieldComponent } from '../form-field/formfield.component';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { FeatureControllerService } from '../../shared/generated';
import { FormConfigMockModule } from '../../shared/formconfig-repository/formconfig-mock.module.spec';

describe('FormComponent', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;

  const mockDialogRef = {
    close: jasmine.createSpy('close'),
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports:[
        FormsModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        SharedModule,
        FormConfigMockModule,
      ],
      declarations: [

        FormCreatorComponent,
        AddFeatureComponent,
        FormTreeComponent,
        FormfieldComponent,
        FormCreatorComponent,
        FormComponent ],
      providers:[
        FeatureControllerService,
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
