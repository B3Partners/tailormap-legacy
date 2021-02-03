import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatMap, filter, map, withLatestFrom } from 'rxjs/operators';
import * as FormActions from './form.actions';
import * as WorkflowActions from '../../workflow/state/workflow.actions';
import { of } from 'rxjs';
import { selectCloseAfterSaveFeatureForm } from './form.selectors';
import { Store } from '@ngrx/store';
import { FormAction, FormState } from './form.state';

@Injectable()
export class FormEffects {


  public closePanelAfterSave$ = createEffect(() => this.actions$.pipe(
    ofType(FormActions.setFormAction),
    concatMap(action => of(action).pipe(
      withLatestFrom(this.store$.select(selectCloseAfterSaveFeatureForm)),
    )),
    filter(([formAction, closeAfterSave]) => {
      return formAction.action === FormAction.SAVED && closeAfterSave;
    }),
    map(value => {
      return FormActions.setCloseFeatureForm();
    }),
  ));

  public setNewAction$ = createEffect(() => this.actions$.pipe(
    ofType(FormActions.setFormAction),
    filter(payload => payload.action === FormAction.SAVED),
    map(payload => {
      return FormActions.setFormAction({action: FormAction.IDLE})
    })),
  );


  public setCurrentFeature$ = createEffect(() => this.actions$.pipe(
    ofType(FormActions.setOpenFeatureForm),
    map(payload => {
      return FormActions.setFeature({ feature: payload.features[0] });
    })),
  );

  constructor(
    private actions$: Actions,
    private store$: Store<FormState>,
  ) {
  }

}
