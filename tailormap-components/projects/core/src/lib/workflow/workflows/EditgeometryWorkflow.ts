import { Workflow } from './Workflow';
import * as wellknown from 'wellknown';
import { GeoJSONGeometry } from 'wellknown';
import { Feature, Geometry } from '../../shared/generated';
import { MapClickedEvent } from '../../shared/models/event-models';
import { VectorLayer } from '../../../../../bridge/typings';
import { take, takeUntil } from 'rxjs/operators';
import { WorkflowHelper } from './workflow.helper';
import { Coordinate } from '../../user-interface/models';
import { setOpenFeatureForm } from '../../feature-form/state/form.actions';
import { selectFeatureFormOpen } from '../../feature-form/state/form.selectors';
import { combineLatest } from 'rxjs';
import { selectFormClosed } from '../../feature-form/state/form.state-helpers';
import { selectFeature } from '../state/workflow.selectors';

export class EditgeometryWorkflow extends Workflow {

  constructor() {
    super();
  }

  private feature: Feature = null;
  public afterInit() {
    super.afterInit();
    combineLatest([
      this.store$.select(selectFeatureFormOpen),
      this.store$.pipe(selectFormClosed),
      this.store$.select(selectFeature),
    ])
      .pipe(take(1))
      .subscribe(([close, nothing, feature]) => {
        this.feature = feature;
        this.drawGeom();
      });
  }

  public drawGeom() : void {

    const geom = this.featureInitializerService.retrieveGeometry(this.feature);
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
    const feature = this.feature;
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
