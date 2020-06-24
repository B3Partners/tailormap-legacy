import { TestBed } from '@angular/core/testing';

import { FormActionsService } from './form-actions.service';
import {SharedModule} from "../../shared/shared.module";
import {FeatureControllerService} from "../../shared/generated";
import {MatSnackBarModule} from "@angular/material/snack-bar";

describe('FormActionsService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule(
      {
        imports:[
          SharedModule,
          MatSnackBarModule,
        ],

        providers:[
          FeatureControllerService,
          ]
      }
      )
  );

  it('should be created', () => {
    const service: FormActionsService = TestBed.get(FormActionsService);
    expect(service).toBeTruthy();
  });
});
