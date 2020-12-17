import { Workflow } from './Workflow';
import * as wellknown from 'wellknown';
import { Feature } from '../../shared/generated';
// import { FormComponent } from '../../feature-form/form/form.component';
import { LayerUtils } from '../../shared/layer-utils/layer-utils.service';
import {
  MapClickedEvent,
} from '../../shared/models/event-models';
import {
  OLFeature,
  VectorLayer,
} from '../../../../../bridge/typings';
import { FormComponent } from '../../feature-form/form/form.component';
import { takeUntil } from 'rxjs/operators';
import { GeoJSONGeometry } from 'wellknown';
import { WorkflowHelpers } from './Workflow.helpers';

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
    const geoJson = wellknown.parse(geom);

    const coord = WorkflowHelpers.findTopRight(geoJson);
    this.geometryConfirmService.open(coord).pipe(takeUntil(this.destroyed)).subscribe(accepted => {
      if (accepted) {
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
    const dialogRef = this.dialog.open(FormComponent, {
      id: this.FORMCOMPONENT_DIALOG_ID,
      width: '1050px',
      height: '800px',
      disableClose: true,
      data: {
        formFeatures,
        isBulk: false,
      },
    });
    // tslint:disable-next-line: rxjs-no-ignored-subscription
    dialogRef.afterClosed().subscribe(result => {
      this.afterEditting();
      this.isDrawing = false;
    });
  }

  public mapClick(data: MapClickedEvent): void {
    if(!this.isDrawing) {

      const x = data.x;
      const y = data.y;
      const scale = data.scale;
      const featureTypes: string[] = this.getFeatureTypesAllowed();
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

  private getFeatureTypesAllowed(): string[] {
    let allowedFeaturesTypes = [];
    const sl = this.tailorMap.selectedLayer;
    if (sl) {
      allowedFeaturesTypes.push(LayerUtils.sanitizeLayername(sl.layerName));
    } else {
      allowedFeaturesTypes = this.formConfigRepo.getFeatureTypes();
    }
    const visibleLayers = this.calculateVisibleLayers();
    const newAr = allowedFeaturesTypes.filter(value => visibleLayers.includes(value))
    return newAr;
  }

  private calculateVisibleLayers(): string[] {
    const visibleLayers = [];

    const appLayers = this.tailorMap.getViewerController().getVisibleLayers();
    appLayers.forEach(appLayerId => {
      const appLayer = this.tailorMap.getViewerController().getAppLayerById(appLayerId);
      let layerName: string = appLayer.layerName;
      layerName = LayerUtils.sanitizeLayername(layerName);
      visibleLayers.push(layerName);
    });
    return visibleLayers;
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
