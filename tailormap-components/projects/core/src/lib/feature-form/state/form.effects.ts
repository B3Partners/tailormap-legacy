import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatMap, filter, map, withLatestFrom } from 'rxjs/operators';
import * as FormActions from './form.actions';
import { of } from 'rxjs';
import { selectCloseAfterSaveFeatureForm } from './form.selectors';
import { Store } from '@ngrx/store';
import { FormState } from './form.state';

@Injectable()
export class FormEffects {


  public closePanelAfterSave$ = createEffect(() => this.actions$.pipe(
    ofType(FormActions.setSetFeatures),
    concatMap(action => of(action).pipe(
      withLatestFrom(this.store$.select(selectCloseAfterSaveFeatureForm)),
    )),
    filter(([_formAction, closeAfterSave]) => {
      return closeAfterSave;
    }),
    map(() => {
      return FormActions.setCloseFeatureForm();
    }),
  ));

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
