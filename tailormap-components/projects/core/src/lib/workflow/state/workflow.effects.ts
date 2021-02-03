import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatMap, filter, map, withLatestFrom } from 'rxjs/operators';
import * as WorkflowActions from './workflow.actions';
import * as FormActions from '../../feature-form/state/form.actions';
import { WORKFLOW_ACTION } from './workflow-models';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { FormState } from '../../feature-form/state/form.state';
import { selectCloseAfterSaveFeatureForm } from '../../feature-form/state/form.selectors';

@Injectable()
export class WorkflowEffects {

  constructor(
    private actions$: Actions,
  ) {
  }

}
