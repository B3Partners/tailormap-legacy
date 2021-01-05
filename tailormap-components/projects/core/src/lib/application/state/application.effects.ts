import { Injectable } from '@angular/core';
import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';
import {
  Actions,
  createEffect,
  ofType,
} from '@ngrx/effects';
import * as ApplicationActions from './application.actions';
import { tap } from 'rxjs/operators';

@Injectable()
export class ApplicationEffects {

  public addAppLayer$ = createEffect(() => this.actions$.pipe(
    ofType(ApplicationActions.addAppLayer),
    tap(action => {
      const viewerController = this.tailormapService.getViewerController();
      viewerController.addUserLayer({...action.layer}, action.levelId, action.service);
    })), { dispatch: false },
  );

  constructor(
    private actions$: Actions,
    private tailormapService: TailorMapService,
  ) {}

}
