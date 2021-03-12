import { Injectable, OnDestroy } from '@angular/core';
import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';
import { Store } from '@ngrx/store';
import { ApplicationState } from '../state/application.state';
import { setApplicationContent, setFormConfigs, setLayerVisibility, setSelectedAppLayer } from '../state/application.actions';
import { concatMap, take, takeUntil, tap, throttleTime } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormConfigRepositoryService } from '../../shared/formconfig-repository/form-config-repository.service';
import { DomainRepositoryService } from '../../feature-form/linked-fields/domain-repository/domain-repository.service';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService implements OnDestroy {

  private destroyed = new Subject();

  private applicationId: number;
  private visibilityChangedMap: Map<string, boolean> = new Map();

  constructor(
    private tailormapService: TailorMapService,
    private store$: Store<ApplicationState>,
    private formConfigRepositoryService: FormConfigRepositoryService,
    private domainRepositoryService: DomainRepositoryService,
  ) {
    this.tailormapService.applicationConfig$
      .pipe(
        take(1),
      )
      .subscribe(app => {
        this.store$.dispatch(setApplicationContent({
          id: app.id,
          root: app.selectedContent,
          levels: Object.values(app.levels),
          layers: Object.values(app.appLayers),
        }));
        this.applicationId = app.id;

        this.updateLayerVisibility();
      });

    this.tailormapService.layerVisibilityChanged$
      .pipe(
        takeUntil(this.destroyed),
        tap(event => this.visibilityChangedMap.set(`${event.layer.id}`, event.visible)),
        throttleTime(100),
      )
      .subscribe(event => {
        this.store$.dispatch(setLayerVisibility({ visibility: this.visibilityChangedMap }));
        this.visibilityChangedMap = new Map();
      });

    this.tailormapService.selectedLayerChanged$
      .pipe(takeUntil(this.destroyed))
      .subscribe(selectedAppLayer => {
        this.store$.dispatch(setSelectedAppLayer({ layerId: !!selectedAppLayer ? `${selectedAppLayer.id}` : null }));
      });

    this.formConfigRepositoryService.loadFormConfiguration$()
      .pipe(
        takeUntil(this.destroyed),
        concatMap(formConfigs => this.domainRepositoryService.initFormConfig$(formConfigs)),
      )
      .subscribe(formConfigs => {
        this.store$.dispatch(setFormConfigs({ formConfigs }));
      })
  }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public getId() {
    return this.applicationId;
  }

  private updateLayerVisibility() {
    this.tailormapService.layersInitialized$
      .pipe(take(1))
      .subscribe(() => {
        const visibleLayers = this.tailormapService.getViewerController().getVisibleLayers();
        const layerVisibility = new Map<string, boolean>(visibleLayers.map(layerId => [ `${layerId}`, true ]));
        this.store$.dispatch(setLayerVisibility({ visibility: layerVisibility }));
      });
  }

}
