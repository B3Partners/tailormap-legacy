import { Workflow } from './Workflow';
import * as wellknown from 'wellknown';
import { Feature } from '../../shared/generated';
// import { FormComponent } from '../../feature-form/form/form.component';
import { LayerUtils } from '../../shared/layer-utils/layer-utils.service';
import {
  MapClickedEvent,
} from '../../shared/models/event-models';
import { VectorLayer } from '../../../../../bridge/typings';
import { FormComponent } from '../../feature-form/form/form.component';

export class StandardFormWorkflow extends Workflow {

  private featureType: string;

  constructor() {
    super();
  }

  public addFeature(featureType: string) {
    this.featureType = featureType;
    this.vectorLayer.drawFeature('Polygon');
  }

  public geometryDrawn(vectorLayer: VectorLayer, feature: any) {
    const geom = feature.config.wktgeom;
    const geoJson = wellknown.parse(geom);
    const objecttype = this.featureType.charAt(0).toUpperCase() + this.featureType.slice(1);
    const feat = this.featureInitializerService.create(objecttype,
      {geometrie: geoJson, clazz: this.featureType, children: []});

    const features: Feature[] = [feat];
    this.openDialog(features);
  }

  public openDialog(formFeatures ?: Feature[]): void {
     const dialogRef = this.dialog.open(FormComponent, {
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
     });
  }

  public mapClick(data: MapClickedEvent): void {
    const x = data.x;
    const y = data.y;
    const scale = data.scale;
    const featureTypes: string[] = this.getFeatureTypesAllowed();
    this.service.featuretypeOnPoint({featureTypes, x, y, scale}).subscribe(
      (features: Feature[]) => {
        if (features && features.length > 0) {
          const feat = features[0];

          this.highlightLayer.readGeoJSON(this.featureInitializerService.retrieveGeometry(feat));

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

  private getFeatureTypesAllowed(): string[] {
    let allowedFeaturesTypes = [];
    const sl = this.tailorMap.selectedLayer;
    if (sl) {
      allowedFeaturesTypes.push(LayerUtils.sanitzeLayername(sl.layerName));
    } else {
      allowedFeaturesTypes = this.formConfigRepo.getFeatureTypes();
    }
    return allowedFeaturesTypes;
  }

  public afterEditting(): void {
    this.vectorLayer.removeAllFeatures();
    this.highlightLayer.removeAllFeatures();

    this.tailorMap.getViewerController().mapComponent.getMap().update();
  }

  public setFeature(feature: Feature): void {
  }

  public getDestinationFeatures(): Feature[] {
    return [];
  }

}
