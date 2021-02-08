import { Workflow } from './Workflow';
import * as wellknown from 'wellknown';
import { GeoJSONGeometry } from 'wellknown';
import { Feature } from '../../shared/generated';
import { MapClickedEvent } from '../../shared/models/event-models';
import { OLFeature, VectorLayer } from '../../../../../bridge/typings';
import { take, takeUntil } from 'rxjs/operators';
import { WorkflowHelper } from './workflow.helper';
import * as FormActions from '../../feature-form/state/form.actions';
import { selectFormClosed } from '../../feature-form/state/form.state-helpers';
import { selectFormConfigForFeatureType, selectFormFeaturetypes } from '../../feature-form/state/form.selectors';
import { selectAction, selectFeatureType, selectGeometryType } from '../state/workflow.selectors';
import { combineLatest } from 'rxjs';


export class StandardFormWorkflow extends Workflow {

  private featureType: string;
  private isDrawing = false;

  constructor() {
    super();
  }

  public afterInit() {
    super.afterInit();
    combineLatest([
      this.store$.select(selectGeometryType),
      this.store$.select(selectFeatureType),
    ]).pipe(takeUntil(this.destroyed))
      .subscribe(([geometryType, featureType]) => {
        this.featureType = featureType;
        if (geometryType || this.featureType) {
          if (geometryType) {
            this.vectorLayer.drawFeature(this.convertGeomType(geometryType));
          } else {
            this.store$.select(selectFormConfigForFeatureType, this.featureType)
              .pipe(takeUntil(this.destroyed))
              .subscribe(formConfig => {
                const geomtype = formConfig.featuretypeMetadata.geometryType;
                this.vectorLayer.drawFeature(this.convertGeomType(geomtype));
              });
          }
          this.isDrawing = true;
        }
      });
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
    this.store$.dispatch(FormActions.setOpenFeatureForm({features: formFeatures}))
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

      this.store$.select(selectFormFeaturetypes)
        .pipe(takeUntil(this.destroyed))
        .subscribe(allFeatureTypes => {
          const featureTypes: string[] = this.layerUtils.getFeatureTypesAllowed(allFeatureTypes);
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
        });
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
