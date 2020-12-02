import { Injectable } from '@angular/core';
import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';
import { Store } from '@ngrx/store';
import { ApplicationState } from '../state/application.state';
import { setApplicationContent } from '../state/application.actions';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {

  constructor(
    tailormapService: TailorMapService,
    store$: Store<ApplicationState>,
  ) {
    tailormapService.applicationConfig$
      .pipe(
        take(1),
      )
      .subscribe(app => {
        store$.dispatch(setApplicationContent({
          id: app.id,
          root: app.selectedContent,
          levels: Object.values(app.levels).map(l => ({...l, id: `${l.id}`})),
          layers: Object.values(app.appLayers).map(l => ({...l, id: `${l.id}`})),
        }));
      });
  }

}
