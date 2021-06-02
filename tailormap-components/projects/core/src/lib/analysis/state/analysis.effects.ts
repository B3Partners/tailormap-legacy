import { Injectable } from '@angular/core';
import {
  Actions, concatLatestFrom,
  createEffect,
  ofType,
} from '@ngrx/effects';
import * as AnalysisActions from './analysis.actions';
import { filter, map, switchMap } from 'rxjs/operators';
import { selectCanCreateLayer } from './analysis.selectors';
import { Store } from '@ngrx/store';
import { CreateStyleService } from '../services/create-style.service';
import { UserLayerStyleModel } from '../models/user-layer-style.model';

@Injectable()
export class AnalysisEffects {

  public loadThematicStyles$ = createEffect(() => this.actions$.pipe(
    ofType(AnalysisActions.loadStyles),
    concatLatestFrom(() => this.store$.select(selectCanCreateLayer)),
    filter(([ _action, canCreateLayer ]) => canCreateLayer),
    switchMap(() => this.createStyleService.createStyles$() ),
    map((result: { styles: UserLayerStyleModel[]; errorMessage?: string}) => {
      if (result.errorMessage && typeof result.errorMessage === 'string') {
        return AnalysisActions.loadStylesFailed({ error: result.errorMessage });
      }
      return AnalysisActions.loadStylesSuccess({ styles: result.styles });
    }),
  ));

  constructor(
    private store$: Store,
    private actions$: Actions,
    private createStyleService: CreateStyleService,
  ) {}

}
