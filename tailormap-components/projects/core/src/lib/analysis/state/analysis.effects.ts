import { Injectable } from '@angular/core';
import {
  Actions,
  createEffect,
  ofType,
} from '@ngrx/effects';
import * as AnalysisActions from './analysis.actions';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { ValueService } from '../../shared/value-service/value.service';
import { of } from 'rxjs';
import { UniqueValuesResponse } from '../../shared/value-service/value-models';
import { ScopedUserLayerStyleModel } from '../models/scoped-user-layer-style.model';
import { StyleHelper } from '../helpers/style.helper';
import { AttributeTypeHelper } from '../../application/helpers/attribute-type.helper';
import { IdService } from '../../shared/id-service/id.service';

@Injectable()
export class AnalysisEffects {

  public loadThematicStyles$ = createEffect(() => this.actions$.pipe(
    ofType(AnalysisActions.loadThematicStyles),
    filter(action => !!action.appLayer),
    switchMap(action => {
      const attribute = action.attribute.name;
      return this.valueService.uniqueValues({
        applicationLayer: action.appLayer,
        attributes: [ action.attribute.name ],
      }).pipe(
        map((response: UniqueValuesResponse) => {
          let styles: ScopedUserLayerStyleModel[] = [];
          if (response.uniqueValues && response.uniqueValues.hasOwnProperty(attribute) && Array.isArray(response.uniqueValues[attribute])) {
            styles = response.uniqueValues[attribute].map(value => ({
              ...StyleHelper.getDefaultStyle(this.idService),
              value,
              attribute,
              attributeType: AttributeTypeHelper.getAttributeType(action.attribute),
            }));
          }
          return AnalysisActions.loadThematicStylesSuccess({ styles });
        }),
        catchError(() => {
          return of(AnalysisActions.loadThematicStylesFailed({ error: `Het is niet gelukt om de stijlen op te halen voor dit atttribuut (${action.attribute.name})` }));
        }),
      );
    }),
  ));

  constructor(
    private actions$: Actions,
    private valueService: ValueService,
    private idService: IdService,
  ) {}

}
