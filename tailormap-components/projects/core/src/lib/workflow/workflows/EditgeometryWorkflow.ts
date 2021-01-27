import { Workflow } from './Workflow';
import * as wellknown from 'wellknown';
import { GeoJSONGeometry } from 'wellknown';
import { Feature, Geometry } from '../../shared/generated';
import { MapClickedEvent } from '../../shared/models/event-models';
import { VectorLayer } from '../../../../../bridge/typings';
import { filter, take, takeUntil } from 'rxjs/operators';
import { WorkflowHelper } from './workflow.helper';
import { Coordinate } from '../../user-interface/models';
import { setOpenFeatureForm } from '../../feature-form/state/form.actions';
import { selectFeatureFormOpen, selectOpenFeatureForm } from '../../feature-form/state/form.selectors';
import { combineLatest } from 'rxjs';
import { selectFormClosed } from '../../feature-form/state/form.state-helpers';

export class EditgeometryWorkflow extends Workflow {

  constructor() {
    super();
  }
 
  public afterInit() {
    super.afterInit();
    combineLatest([
      this.store$.select(selectFeatureFormOpen),
      this.store$.pipe(selectFormClosed),
    ])
      .pipe(take(1))
      .subscribe(([close, savedFeature]) => {
        this.drawGeom();
      });
  }

  public drawGeom() : void {
    const feat = this.event.feature
    const geom = this.featureInitializerService.retrieveGeometry(feat);
    if (geom) {
      this.vectorLayer.readGeoJSON(geom);

      const coord : Coordinate = WorkflowHelper.findTopRight(geom) ;
      this.geometryConfirmService.open(coord).pipe(takeUntil(this.destroyed)).subscribe(accepted => {
        if (accepted) {
          const wkt = this.vectorLayer.getActiveFeature().config.wktgeom;
          const geoJson = wellknown.parse(wkt);
          this.openForm(geoJson, true);
        } else {
          this.vectorLayer.removeAllFeatures();
          this.openForm(geom, false);
          this.endWorkflow();
        }
        this.geometryConfirmService.hide();
      });
    }
  }

  private openForm(geom: GeoJSONGeometry | Geometry, geomChanged: boolean) {
    const feature = this.event.feature;
    const objecttype = feature.objecttype;
    const feat = this.featureInitializerService.create(objecttype,
      {...feature, geometrie: geom  });
    feat.objectGuid = feature.objectGuid;
    this.store$.dispatch(setOpenFeatureForm({ features: [feat], closeAfterSave: false, alreadyDirty: geomChanged }))

    this.store$.pipe(selectFormClosed)
      .pipe(take(1))
      .subscribe(( close) => {
        this.afterEditting();
      });
  }

  public afterEditting() {
    this.ngZone.runOutsideAngular(() => {
      this.vectorLayer.removeAllFeatures();
      this.highlightLayer.removeAllFeatures();
      this.tailorMap.getViewerController().mapComponent.getMap().update();
    });
    this.endWorkflow();
  }

  public geometryDrawn(vectorLayer: VectorLayer, feature: any): void {
  }

  public getDestinationFeatures(): Feature[] {
    return [];
  }

  public mapClick(data: MapClickedEvent): void {
  }

}
