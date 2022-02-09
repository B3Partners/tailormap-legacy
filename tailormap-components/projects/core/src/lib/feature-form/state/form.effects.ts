import { Inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatMap, filter, map, withLatestFrom } from 'rxjs/operators';
import * as FormActions from './form.actions';
import * as ApplicationActions from '../../application/state/application.actions';
import { of } from 'rxjs';
import { selectCloseAfterSaveFeatureForm } from './form.selectors';
import { Store } from '@ngrx/store';
import { FormState } from './form.state';
import { APPLICATION_SERVICE, ApplicationServiceModel } from '@tailormap/api';

@Injectable()
export class FormEffects {

  public editFeatures$ = createEffect(() => this.actions$.pipe(
    ofType(ApplicationActions.editFeatures),
    map(action => {
      return FormActions.setOpenFeatureForm({
        features: action.features,
        closeAfterSave: true,
        editMode: true,
        bulkEditFilter: action.bulkEditFilter,
        bulkEditFeatureTypeName: action.bulkEditFeatureTypeName,
        bulkEditFilterType: action.bulkEditFilterType,
      });
    }),
  ));

  public closePanelAfterSave$ = createEffect(() => this.actions$.pipe(
    ofType(FormActions.setNewFeature),
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

  public setEditFeatureComplete$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ApplicationActions.editFeaturesComplete),
      map(payload => this.applicationService.setEditFeaturesCompleted(payload.layerId)),
    );
  }, { dispatch: false });

  constructor(
    private actions$: Actions,
    private store$: Store<FormState>,
    @Inject(APPLICATION_SERVICE) private applicationService: ApplicationServiceModel,
  ) {
  }

}
