import { Injectable } from '@angular/core';
import {
  act,
  Actions,
  createEffect,
  ofType,
} from '@ngrx/effects';
import * as AttributeListActions from './attribute-list.actions';
import { filter, tap } from 'rxjs/operators';
import { HighlightService } from '../../../shared/highlight-service/highlight.service';

@Injectable()
export class AttributeListEffects {

  public hideAttributeList$ = createEffect(() => this.actions$.pipe(
    ofType(AttributeListActions.setAttributeListVisibility),
    filter((action) => !action.visible),
    tap(action => {
      this.highlightService.clearHighlight();
    })), { dispatch: false },
  );

  public changeAttributeListTab$ = createEffect(() => this.actions$.pipe(
    ofType(AttributeListActions.setSelectedTab),
    tap(action => {
      this.highlightService.clearHighlight();
    })), { dispatch: false },
  );

  constructor(
    private actions$: Actions,
    private highlightService: HighlightService,
  ) {}

}
