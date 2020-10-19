import { Workflow } from './Workflow';
import { VectorLayer } from '../../../../../bridge/typings';
import { MapClickedEvent } from '../../shared/models/event-models';
import { Feature } from '../../shared/generated';
import { FormCopyComponent } from '../../feature-form/form-copy/form-copy.component';
import { DialogData } from '../../feature-form/form/form-models';
import { LayerUtils } from '../../shared/layer-utils/layer-utils.service';

export class CopyWorkflow extends Workflow {
  private feature: Feature;

  constructor() {
    super();
  }

  public setFeature(feature: Feature): void {
    this.feature = feature;
    this.openDialog();
  }

  public addFeature(featureType: string): void {
  }

  public afterEditting(): void {
  }

  public geometryDrawn(vectorLayer: VectorLayer, feature: any): void {
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
          this.destinationFeatures.push(feat);
          this.highlightLayer.readGeoJSON(this.featureInitializerService.retrieveGeometry(feat));
        }
      },
      error => {
        this.snackBar.open('Fout: Feature niet kunnen ophalen: ' + error, '', {
          duration: 5000,
        });
      },
    );
  }

  public openDialog() {
    const dialogData : DialogData = {
      formFeatures: [this.feature],
      isBulk: false,
      closeAfterSave: true,
    };
    const dialogRef = this.dialog.open(FormCopyComponent, {
      width: '400px',
      data: dialogData,
      position: {
        top: '5px',
        right: '50px',
      },
      hasBackdrop: false,
    });

    dialogRef.afterClosed().subscribe(result => {
        console.log('copy dialog gesloten');
        this.highlightLayer.removeAllFeatures();
        this.destinationFeatures = [];
    });
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

  public getDestinationFeatures(): Feature[] {
    return this.destinationFeatures;
  }
}
