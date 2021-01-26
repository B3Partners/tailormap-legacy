import { Injectable } from '@angular/core';
import {
  Actions,
  createEffect,
  ofType,
} from '@ngrx/effects';
import * as AnalysisActions from './analysis.actions';
import { concatMap, filter, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import { selectCanCreateLayer } from './analysis.selectors';
import { Store } from '@ngrx/store';
import { AnalysisState } from './analysis.state';
import { CreateStyleService } from '../services/create-style.service';
import { UserLayerStyleModel } from '../models/user-layer-style.model';

@Injectable()
export class AnalysisEffects {

  public loadThematicStyles$ = createEffect(() => this.actions$.pipe(
    ofType(AnalysisActions.loadStyles),
    concatMap(action => of(action).pipe(
      withLatestFrom(this.store$.select(selectCanCreateLayer)),
    )),
    filter(([ action, canCreateLayer ]) => canCreateLayer),
    switchMap(() => this.createStyleService.createStyles$() ),
    map((result: { styles: UserLayerStyleModel[], errorMessage?: string}) => {
      if (result.errorMessage && typeof result.errorMessage === 'string') {
        return AnalysisActions.loadStylesFailed({ error: result.errorMessage });
      }
      return AnalysisActions.loadStylesSuccess({ styles: result.styles });
    }),
  ));

  constructor(
    private store$: Store<AnalysisState>,
    private actions$: Actions,
    private createStyleService: CreateStyleService,
  ) {}

}
