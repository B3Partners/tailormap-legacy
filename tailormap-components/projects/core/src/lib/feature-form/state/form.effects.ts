import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, tap } from 'rxjs/operators';
import * as FormActions from './form.actions';
import { FormState } from './form.state';
import { Store } from '@ngrx/store';

@Injectable()
export class FormEffects {

  public setCurrentFeature$ = createEffect(() => this.actions$.pipe(
    ofType(FormActions.setOpenFeatureForm),
    map(payload => {
      return FormActions.setFeature({ feature: payload.features[0] });
    })),
  );

  constructor(
    private store$: Store<FormState>,
    private actions$: Actions,
  ) {
  }

}
