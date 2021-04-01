import { Workflow } from './Workflow';
import { MapClickedEvent } from '../../shared/models/event-models';
import { Feature } from '../../shared/generated';
import { FormCopyComponent } from '../../feature-form/form-copy/form-copy.component';
import { CopyDialogData } from '../../feature-form/form-copy/form-copy-models';
import { selectFeature } from '../state/workflow.selectors';
import { takeUntil } from 'rxjs/operators';

export class CopyWorkflow extends Workflow {
  private feature: Feature;

  constructor() {
    super();
  }

  public afterInit() {
    super.afterInit();
    this.store$.select(selectFeature).pipe(takeUntil(this.destroyed)).subscribe(feature => {
      this.feature = feature;
      this.openDialog();
    });

  }

  public afterEditing(): void {
  }

  public geometryDrawn(): void {
  }

  public mapClick(data: MapClickedEvent): void {
    const x = data.x;
    const y = data.y;
    const scale = data.scale;
    const featureTypes: string[] = [this.feature.clazz];
    this.service.featuretypeOnPoint({featureTypes, x, y, scale}).subscribe(
      (features: Feature[]) => {
        if (features && features.length > 0) {
          const feat = features[0];
          if (!this.hasDestinationFeature(feat)) {
            this.destinationFeatures.push(feat);
          }
          this.highlightDestinationFeatures();
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
    const dialogData: CopyDialogData = {
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

    dialogRef.afterClosed().subscribe(() => {
      this.highlightLayer.removeAllFeatures();
      this.destinationFeatures = [];
      this.endWorkflow();
    });
  }

  public getDestinationFeatures(): Feature[] {
    return this.destinationFeatures;
  }
}
