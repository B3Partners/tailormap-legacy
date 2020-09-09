import { TestBed } from '@angular/core/testing';

import { FormActionsService } from './form-actions.service';
import {SharedModule} from "../../shared/shared.module";
import {FeatureControllerService} from "../../shared/generated";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import { FormConfigMockModule } from '../../shared/formconfig-repository/formconfig-mock.module.spec';

describe('FormActionsService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule(
      {
        imports:[
          SharedModule,
          MatSnackBarModule,
          FormConfigMockModule,
        ],

        providers:[
          FeatureControllerService,
          ]
      }
      )
  );

  it('should be created', () => {
    const service: FormActionsService = TestBed.inject(FormActionsService);
    expect(service).toBeTruthy();
  });
});
