import { Component, OnDestroy } from '@angular/core';
import { AttributeListService } from '@tailormap/core-components';
import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';
import { Feature, FeatureControllerService } from '../../shared/generated';
import { concatMap, map, take, takeUntil } from 'rxjs/operators';
import { combineLatest, forkJoin, Observable, of, Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { editFeatures } from '../../application/state/application.actions';

@Component({
  selector: 'tailormap-form-attribute-list-button',
  templateUrl: './form-attribute-list-button.component.html',
  styleUrls: ['./form-attribute-list-button.component.css'],
})
export class FormAttributeListButtonComponent implements OnDestroy {

  public canOpenForm: boolean;

  private destroyed = new Subject();

  constructor(
    private tailorMapService: TailorMapService,
    private attributeListService: AttributeListService,
    private featureControllerService: FeatureControllerService,
    private store$: Store,
  ) {
    this.attributeListService.getCheckedRows$()
      .pipe(
        takeUntil(this.destroyed),
        map(rows => rows.length),
      )
      .subscribe(rowCount => {
        this.canOpenForm = rowCount > 0;
      });
  }

  public static registerWithAttributeList(attributeListService: AttributeListService) {
    attributeListService.registerComponent(FormAttributeListButtonComponent);
  }

  public ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public openPassportForm(): void {
    this.getCheckedRowsAsFeatures$()
      .pipe(
        take(1),
      )
      .subscribe(([ layerId, features ]) => {
        if (features.length === 0) {
          return;
        }
        this.store$.dispatch(editFeatures({ features, layerId }));
      });
  }

  private getCheckedRowsAsFeatures$(): Observable<[ string, Feature[] ]> {
    return combineLatest([
      this.attributeListService.getCheckedRows$(),
      this.attributeListService.getSelectedLayerId$(),
    ])
      .pipe(
        take(1),
        concatMap(([ rows, layerId ]) => {
          if (rows.length === 0) {
            return forkJoin([ of(layerId), of([]) ]);
          }
          const appLayer = this.tailorMapService.getApplayerById(+(layerId));
          return forkJoin([
            of(layerId),
            this.featureControllerService.getFeaturesForIds({
              application: this.tailorMapService.getApplicationId(),
              featureType: appLayer.featureTypeName,
              featureIds: rows.map(row => `${row.__fid}`),
            }).pipe(
              map(features => {
                if (!features || features.length === 0) {
                  return [];
                }
                const fidList = new Set<string>();
                const uniqueFeatures: Feature[] = [];
                features.forEach(feature => {
                  if (!fidList.has(feature.fid)) {
                    fidList.add(feature.fid);
                    uniqueFeatures.push(feature);
                  }
                });
                return uniqueFeatures;
              }),
            ),
          ]);
        }),
      );
  }

}
