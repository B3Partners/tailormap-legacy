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
    tailormapService.viewerController$
      .pipe(
        take(1),
      )
      .subscribe(viewerController => {
        store$.dispatch(setApplicationContent({
          id: viewerController.app.id,
          root: viewerController.app.selectedContent,
          levels: Object.values(viewerController.app.levels).map(l => ({...l, id: `${l.id}`})),
          layers: Object.values(viewerController.app.appLayers).map(l => ({...l, id: `${l.id}`})),
        }));
      });
  }

}
