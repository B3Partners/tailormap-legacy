import { Workflow } from './Workflow';
import { VectorLayer } from '../../../../../bridge/typings';
import { MapClickedEvent } from '../../shared/models/event-models';
import { Feature } from '../../shared/generated';
import { FormCopyComponent } from '../../feature-form/form-copy/form-copy.component';
import { LayerUtils } from '../../shared/layer-utils/layer-utils.service';
import { CopyDialogData } from '../../feature-form/form-copy/form-copy-models';

export class CopyWorkflow extends Workflow {
  private feature: Feature;

  constructor() {
    super();
  }

  public afterInit() {
    super.afterInit();
    this.feature = this.event.feature;
    this.openDialog();
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
          if ( this.feature.clazz === feat.clazz) {
            if (!this.hasDestinationFeature(feat)) {
              this.destinationFeatures.push(feat);
            }
            this.highlightDestinationFeatures();
          } else {
            this.snackBar.open('Geselecteerde feature is niet van hetzelfde type', '', {
              duration: 5000,
            });
          }
        }
      },
      error => {
        this.snackBar.open('Fout: Feature niet kunnen ophalen: ' + error, '', {
          duration: 5000,
        });
      },
    );
  }

  private hasDestinationFeature(feat: Feature): boolean {
    let hasDestinationFeature = false;
    for (let i = 0 ; i <= this.destinationFeatures.length - 1; i++) {
      if (this.destinationFeatures[i].objectGuid === feat.objectGuid ) {
        hasDestinationFeature = true;
        this.destinationFeatures.splice(i, 1);
        break;
      }
    }
    return hasDestinationFeature;
  }

  public highlightDestinationFeatures () {
    this.highlightLayer.removeAllFeatures();
    for (let i = 0 ; i <= this.destinationFeatures.length - 1; i++) {
      const feat = this.destinationFeatures[i];
      this.highlightLayer.readGeoJSON(this.featureInitializerService.retrieveGeometry(feat));
    }
  }

  public openDialog() {
    const dialogData : CopyDialogData = {
      originalFeature: this.feature,
      destinationFeatures: this.destinationFeatures,

    };
    const dialogRef = this.dialog.open(FormCopyComponent, {
      width: '400px',
      data: dialogData,
      position: {
        right: '50px',
      },
      hasBackdrop: false,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('copy dialog gesloten');
      this.highlightLayer.removeAllFeatures();
      this.destinationFeatures = [];
      this.endWorkflow();
    });
  }

  private getFeatureTypesAllowed(): string[] {
    let allowedFeaturesTypes = [];
    const sl = this.tailorMap.selectedLayer;
    if (sl) {
      allowedFeaturesTypes.push(LayerUtils.sanitizeLayername(sl.layerName));
    } else {
      allowedFeaturesTypes = this.formConfigRepo.getFeatureTypes();
    }
    return allowedFeaturesTypes;
  }

  public getDestinationFeatures(): Feature[] {
    return this.destinationFeatures;
  }
}