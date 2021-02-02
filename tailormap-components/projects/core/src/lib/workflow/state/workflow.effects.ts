import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatMap, filter, map, withLatestFrom } from 'rxjs/operators';
import * as WorkflowActions from './workflow.actions';
import * as FormActions from '../../feature-form/state/form.actions';
import { WorkflowAction } from './workflow.state';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { FormState } from '../../feature-form/state/form.state';
import { selectCloseAfterSaveFeatureForm } from '../../feature-form/state/form.selectors';

@Injectable()
export class WorkflowEffects {


  public closePanelAfterSave$ = createEffect(() => this.actions$.pipe(
    ofType(WorkflowActions.setAction),
    concatMap(action => of(action).pipe(
      withLatestFrom(this.store$.select(selectCloseAfterSaveFeatureForm)),
    )),
    filter(([workflowAction, closeAfterSave]) => {
      return workflowAction.action === WorkflowAction.SAVED && closeAfterSave;
    }),
    map(value => {
      return FormActions.setCloseFeatureForm();
    }),
  ));

  public setNewAction$ = createEffect(() => this.actions$.pipe(
    ofType(WorkflowActions.setAction),
    filter(payload => payload.action === WorkflowAction.SAVED),
    map(payload => {
      return WorkflowActions.setAction({action: WorkflowAction.IDLE})
    })),
  );

  constructor(
    private actions$: Actions,
    private store$: Store<FormState>,
  ) {
  }

}
