import { Injectable } from '@angular/core';
import {
  Actions,
  createEffect,
  ofType,
} from '@ngrx/effects';
import * as AnalysisActions from './analysis.actions';
import { catchError, filter, map, switchMap, tap } from 'rxjs/operators';
import { ValueService } from '../../shared/value-service/value.service';
import { of } from 'rxjs';
import { UniqueValuesResponse } from '../../shared/value-service/value-models';
import { ScopedUserLayerStyleModel } from '../models/scoped-user-layer-style.model';

@Injectable()
export class AnalysisEffects {

  public loadThematicStyles$ = createEffect(() => this.actions$.pipe(
    ofType(AnalysisActions.loadThematicStyles),
    filter(action => !!action.appLayer),
    switchMap(action => {
      return this.valueService.uniqueValues({
        applicationLayer: action.appLayer,
        attributes: [ action.attribute.name ],
      }).pipe(
        map((response: UniqueValuesResponse) => {
          const styles: ScopedUserLayerStyleModel[] = [];
          console.log(response);
          return AnalysisActions.loadThematicStylesSuccess({ styles });
        }),
        catchError(e => {
          return of(AnalysisActions.loadThematicStylesFailed({ error: `Het is niet gelukt om de stijlen op te halen voor dit atttribuut (${action.attribute.name})` }));
        }),
      );
    }),
  ));

  constructor(
    private actions$: Actions,
    private valueService: ValueService,
  ) {}

}
