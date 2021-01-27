import { Workflow } from './Workflow';
import * as wellknown from 'wellknown';
import { GeoJSONGeometry } from 'wellknown';
import { Feature } from '../../shared/generated';
import { MapClickedEvent } from '../../shared/models/event-models';
import { OLFeature, VectorLayer } from '../../../../../bridge/typings';
import { take, takeUntil } from 'rxjs/operators';
import { WorkflowHelper } from './workflow.helper';
import { setOpenFeatureForm } from '../../feature-form/state/form.actions';
import { selectFormClosed } from '../../feature-form/state/form.state-helpers';

export class StandardFormWorkflow extends Workflow {

  private featureType: string;
  private isDrawing = false;

  constructor() {
    super();
  }

  public afterInit() {
    super.afterInit();
    this.featureType = this.event.featureType;
    if (this.event.geometryType || this.featureType) {
      const geomtype = this.event.geometryType || this.formConfigRepo.getFormConfig(this.featureType).featuretypeMetadata.geometryType;
      this.vectorLayer.drawFeature(this.convertGeomType(geomtype));
      this.isDrawing = true;
    }
  }

  private convertGeomType(type: string): string {
    switch (type) {
      case 'POLYGON':
        return 'Polygon';
      case 'LINESTRING':
        return 'LineString';
      case 'POINT':
        return 'Point';
      default:
        return 'Geometry';
    }
  }

  public geometryDrawn(vectorLayer: VectorLayer, feature: OLFeature) {
    const geom = feature.config.wktgeom;
    let geoJson = wellknown.parse(geom);

    const coord = WorkflowHelper.findTopRight(geoJson);
    this.geometryConfirmService.open(coord).pipe(takeUntil(this.destroyed)).subscribe(accepted => {
      if (accepted) {
        const wkt = this.vectorLayer.getActiveFeature().config.wktgeom;
        geoJson = wellknown.parse(wkt);
        this.accept(geoJson);
      } else {
        vectorLayer.removeAllFeatures();
        this.endWorkflow();
      }
      this.geometryConfirmService.hide();
    });
  }

  private accept(geoJson: GeoJSONGeometry): void {
    const objecttype = this.featureType.charAt(0).toUpperCase() + this.featureType.slice(1);
    const feat = this.featureInitializerService.create(objecttype,
      {geometrie: geoJson, clazz: this.featureType, children: []});

    const features: Feature[] = [feat];
    this.openDialog(features);
  }

  public openDialog(formFeatures ?: Feature[]): void {
    this.store$.dispatch(setOpenFeatureForm({features: formFeatures}))
    this.store$.pipe(selectFormClosed)
      .pipe(take(1))
      .subscribe(( close) => {
        this.afterEditting();
      });
  }

  public mapClick(data: MapClickedEvent): void {
    if (!this.isDrawing) {

      const x = data.x;
      const y = data.y;
      const scale = data.scale;
      const featureTypes: string[] = this.layerUtils.getFeatureTypesAllowed(this.formConfigRepo.getFeatureTypes());
      this.service.featuretypeOnPoint({featureTypes, x, y, scale}).subscribe(
        (features: Feature[]) => {
          if (features && features.length > 0) {
            const feat = features[0];

            const geom = this.featureInitializerService.retrieveGeometry(feat);
            if (geom) {
              this.highlightLayer.readGeoJSON(geom);
            }

            this.openDialog([feat]);
          }
        },
        error => {
          this.snackBar.open('Fout: Feature niet kunnen ophalen: ' + error, '', {
            duration: 5000,
          });
        },
      );
    }
  }

  public afterEditting(): void {
    this.ngZone.runOutsideAngular(() => {
      this.vectorLayer.removeAllFeatures();
      this.highlightLayer.removeAllFeatures();

      this.tailorMap.getViewerController().mapComponent.getMap().update();
    });
  }

  public getDestinationFeatures(): Feature[] {
    return [];
  }

}
