import { Workflow } from './Workflow';
import { MapClickedEvent } from '../../shared/models/event-models';
import { Feature } from '../../shared/generated';
import { catchError, concatMap, filter, map, take, takeUntil } from 'rxjs/operators';
import { setCurrentlySelectedRelatedFeature } from '../../feature-form/state/form.actions';
import {
  selectAllowedRelationSelectionFeatureTypes, selectCurrentlySelectedRelatedFeature, selectRelationsFormOpen,
} from '../../feature-form/state/form.selectors';
import { Observable, of } from 'rxjs';

export class CreateRelationsWorkflow extends Workflow {

  constructor() {
    super();
  }

  public afterInit() {
    super.afterInit();
    this.store$.select(selectRelationsFormOpen)
      .pipe(takeUntil(this.destroyed))
      .subscribe((open) => {
        if (!open) {
          this.removeAllHighLightedFeatures();
          this.endWorkflow();
        }
      });
    this.store$.select(selectCurrentlySelectedRelatedFeature)
      .pipe(takeUntil(this.destroyed))
      .subscribe(selectedRelatedFeature => {
        this.highlightSelectedRelatedFeature(selectedRelatedFeature);
      });
  }

  public afterEditing(): void {}

  public geometryDrawn(): void {}

  public mapClick(data: MapClickedEvent): void {
    const x = data.x;
    const y = data.y;
    const scale = data.scale;
    this.store$.select(selectAllowedRelationSelectionFeatureTypes)
      .pipe(
        take(1),
        filter(allowedFeatureTypes => !!allowedFeatureTypes && allowedFeatureTypes.length > 0),
        concatMap(allowedFeatureTypes => this.getClickedFeatures$(allowedFeatureTypes, x, y, scale)),
      )
      .subscribe((feature: Feature | null) => {
        this.store$.dispatch(setCurrentlySelectedRelatedFeature({ relatedFeature: feature }));
      });
  }

  private getClickedFeatures$(featureTypes: string[], x: number, y: number, scale: number): Observable<Feature | null> {
    return this.service.featuretypeOnPoint({ application: this.tailorMap.getApplicationId(), featureTypes, x, y, scale })
      .pipe(
        map((features: Feature[]) => {
          if (features && features.length > 0) {
            return features[0];
          }
          return null;
        }),
        catchError(error => {
          this.snackBar.open('Fout: Feature niet kunnen ophalen: ' + error, '', {
            duration: 5000,
          });
          return of(null);
        }),
      );
  }

  private removeAllHighLightedFeatures () {
    this.highlightLayer.removeAllFeatures();
  }

  private highlightSelectedRelatedFeature (feature: Feature | null) {
    this.highlightLayer.removeAllFeatures();
    if (feature === null) {
      return;
    }
    this.highlightLayer.readGeoJSON(this.featureInitializerService.retrieveGeometry(feature));
  }

}
