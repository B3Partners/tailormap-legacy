import { Injectable, OnDestroy } from '@angular/core';
import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';
import { Store } from '@ngrx/store';
import { ApplicationState } from '../state/application.state';
import { setApplicationContent, setSelectedAppLayer } from '../state/application.actions';
import { take, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService implements OnDestroy {

  private destroyed = new Subject();

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
          levels: Object.values(app.levels),
          layers: Object.values(app.appLayers),
        }));
      });

    tailormapService.selectedLayerChanged$
      .pipe(takeUntil(this.destroyed))
      .subscribe(selectedAppLayer => {
        store$.dispatch(setSelectedAppLayer({ layerId: `${selectedAppLayer.id}` }));
      });
  }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

}
