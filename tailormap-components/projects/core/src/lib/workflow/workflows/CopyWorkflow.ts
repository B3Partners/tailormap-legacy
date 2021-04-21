import { Workflow } from './Workflow';
import { MapClickedEvent } from '../../shared/models/event-models';
import { Feature } from '../../shared/generated';
import { selectFeature } from '../state/workflow.selectors';
import { take, takeUntil } from 'rxjs/operators';
import { openCopyForm, toggleCopyDestinationFeature } from '../../feature-form/state/form.actions';
import { selectCopyDestinationFeatures, selectCopyFormOpen } from '../../feature-form/state/form.selectors';

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
    this.store$.select(selectCopyFormOpen).pipe(takeUntil(this.destroyed)).subscribe((open) => {
      if (!open) {
        this.removeAllHighLightedFeatures();
        this.endWorkflow();
      }
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
          this.store$.dispatch(toggleCopyDestinationFeature({destinationFeature: feat}));
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

  private removeAllHighLightedFeatures () {
    this.highlightLayer.removeAllFeatures();
  }

  private highlightDestinationFeatures () {
    this.highlightLayer.removeAllFeatures();
    this.store$.select(selectCopyDestinationFeatures).pipe(take(1)).subscribe((features) => {
      for (let i = 0 ; i <= features.length - 1; i++) {
        const feat = features[i];
        this.highlightLayer.readGeoJSON(this.featureInitializerService.retrieveGeometry(feat));
      }
    });
  }

  public openDialog() {
    this.store$.dispatch(openCopyForm({ feature: this.feature }));
  }

  public getDestinationFeatures(): Feature[] {
    return this.destinationFeatures;
  }
}
