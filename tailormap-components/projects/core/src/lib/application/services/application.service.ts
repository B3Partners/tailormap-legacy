import { Injectable, OnDestroy } from '@angular/core';
import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';
import { Store } from '@ngrx/store';
import { ApplicationState } from '../state/application.state';
import { setApplicationContent, setLayerVisibility, setSelectedAppLayer } from '../state/application.actions';
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

    tailormapService.layersInitialized$
      .pipe(takeUntil(this.destroyed))
      .subscribe(() => {
        const visibleLayers = tailormapService.getViewerController().getVisibleLayers();
        const layerVisibility = new Map<string, boolean>(visibleLayers.map(layerId => [ `${layerId}`, true ]));
        store$.dispatch(setLayerVisibility({ visibility: layerVisibility }));
      });

    tailormapService.layerVisibilityChanged$
      .pipe(takeUntil(this.destroyed))
      .subscribe(event => {
        store$.dispatch(setLayerVisibility({ visibility: new Map<string, boolean>([[ `${event.layer.id}`, event.visible ]]) }));
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
