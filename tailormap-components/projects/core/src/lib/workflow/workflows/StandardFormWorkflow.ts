import { Workflow } from './Workflow';
import * as wellknown from 'wellknown';
import { GeoJSONGeometry } from 'wellknown';
import { Feature } from '../../shared/generated';
import { MapClickedEvent } from '../../shared/models/event-models';
import { OLFeature, VectorLayer } from '../../../../../bridge/typings';
import { concatMap, map, take, takeUntil } from 'rxjs/operators';
import { WorkflowHelper } from './workflow.helper';
import * as FormActions from '../../feature-form/state/form.actions';
import { selectFormClosed } from '../../feature-form/state/form.state-helpers';
import {
  selectFormConfigForFeatureTypeName, selectFormConfigFeatureTypeNames, selectFormConfigs,
} from '../../application/state/application.selectors';
import { selectFeatureType, selectGeometryType } from '../state/workflow.selectors';
import { combineLatest, Observable, of } from 'rxjs';
import { FeatureSelectionComponent } from '../../shared/feature-selection/feature-selection.component';


export class StandardFormWorkflow extends Workflow {

  private featureType: string;
  private isDrawing = false;
  private featureSelectionPopupOpen = false;

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
            this.store$.select(selectFormConfigForFeatureTypeName, this.featureType)
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

    this.geometryConfirmService.open$(coord).pipe(takeUntil(this.destroyed)).subscribe(accepted => {
      if (accepted) {
        const wkt = this.vectorLayer.getActiveFeature().config.wktgeom;
        geoJson = wellknown.parse(wkt);
        this.accept(geoJson);
      } else {
        vectorLayer.removeAllFeatures();
        this.endWorkflow();
      }
      this.isDrawing = false;
      this.geometryConfirmService.hide();
    });
  }

  private accept(geoJson: GeoJSONGeometry): void {
    const objecttype = this.featureType.charAt(0).toUpperCase() + this.featureType.slice(1);
    const feat = this.featureInitializerService.create(objecttype,
      {geometrie: geoJson, clazz: this.featureType, children: []});

    const features: Feature[] = [feat];
    this.openDialog(features, true);
  }

  public openDialog(formFeatures?: Feature[], editMode: boolean = false): void {
    this.store$.dispatch(FormActions.setOpenFeatureForm({features: formFeatures, editMode}));
    this.store$.pipe(selectFormClosed)
      .pipe(take(1))
      .subscribe(( close) => {
        this.afterEditting();
      });
  }

  public mapClick(data: MapClickedEvent): void {
    if (this.isDrawing) {
      return;
    }

    const x = data.x;
    const y = data.y;
    const scale = data.scale;

    this.store$.select(selectFormConfigFeatureTypeNames)
      .pipe(
        takeUntil(this.destroyed),
        concatMap(allFeatureTypes => {
          const featureTypes: string[] = this.layerUtils.getFeatureTypesAllowed(allFeatureTypes);
          return this.service.featuretypeOnPoint({featureTypes, x, y, scale});
        }),
        concatMap((features: Feature[]) => {
          if (features && features.length > 1) {
            return this.featureSelection$(features);
          }
          if (features && features.length === 1) {
            return of(features[0]);
          }
          return of(null);
        }),
      )
      .subscribe(feature => {
        this.featureSelectionPopupOpen = false;
        if (!feature) {
          return;
        }
        this.afterEditting();
        const geom = this.featureInitializerService.retrieveGeometry(feature);
        if (geom) {
          this.highlightLayer.readGeoJSON(geom);
        }
        this.openDialog([feature]);
      });
  }

  private featureSelection$(features: Feature[]): Observable<Feature | null> {
    if (this.featureSelectionPopupOpen) {
      return;
    }
    this.featureSelectionPopupOpen = true;
    return this.store$.select(selectFormConfigs)
      .pipe(
        take(1),
        concatMap(formConfigs => {
          return FeatureSelectionComponent.openFeatureSelectionPopup(this.dialog, features, formConfigs)
            .afterClosed()
            .pipe(map(selectedFeature => selectedFeature || null));
        }),
      );
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
