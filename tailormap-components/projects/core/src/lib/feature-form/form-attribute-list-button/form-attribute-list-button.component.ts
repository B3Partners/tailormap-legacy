import { Component, Inject, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { AttributeListRowModel, AttributeListService } from '@tailormap/core-components';
import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';
import { Feature, FeatureControllerService } from '../../shared/generated';
import { concatMap, map, take, takeUntil } from 'rxjs/operators';
import { combineLatest, forkJoin, Observable, of, Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { editFeatures } from '../../application/state/application.actions';
import { FeatureSelectionHelper } from '../../shared/feature-selection/feature-selection.helper';
import { APPLICATION_SERVICE, ApplicationServiceModel, ExtendedFormConfigurationModel } from '@tailormap/api';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'tailormap-form-attribute-list-button',
  templateUrl: './form-attribute-list-button.component.html',
  styleUrls: ['./form-attribute-list-button.component.css'],
})
export class FormAttributeListButtonComponent implements OnDestroy {

  @ViewChild('loadingMessage', { read: TemplateRef, static: true })
  private loadingMessage: TemplateRef<any>;

  public checkedRowCount: number;
  public totalCount: number | null;

  private destroyed = new Subject();

  constructor(
    private tailorMapService: TailorMapService,
    private attributeListService: AttributeListService,
    private featureControllerService: FeatureControllerService,
    private store$: Store,
    @Inject(APPLICATION_SERVICE) private applicationService: ApplicationServiceModel,
    private snackBar: MatSnackBar,
  ) {
    this.attributeListService.getCheckedRows$()
      .pipe(
        takeUntil(this.destroyed),
        map(rows => rows.length),
      )
      .subscribe(rowCount => {
        this.checkedRowCount = rowCount;
      });
    this.attributeListService.getSelectedFeatureTypeTotalObjects$()
      .pipe(
        takeUntil(this.destroyed),
      )
      .subscribe(totalCount => {
        this.totalCount = totalCount;
      });
  }

  public static registerWithAttributeList(attributeListService: AttributeListService) {
    attributeListService.registerComponent(FormAttributeListButtonComponent);
  }

  public ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public openCheckedFeaturesPassportForm(): void {
    const ref = this.snackBar.openFromTemplate(this.loadingMessage);
    this.getCheckedRowsAsFeatures$()
      .pipe(
        take(1),
      )
      .subscribe(([ layerId, features ]) => {
        if (features.length === 0) {
          return;
        }
        this.store$.dispatch(editFeatures({ features, layerId }));
        ref.dismiss();
      });
  }

  public openBulkEditPassportForm(): void {
    const observables$: [
      Observable<string | null>,
      Observable<string>,
      Observable<{ filter: string; filterType: 'sql' | 'cql' } | null>,
      Observable<Map<string, ExtendedFormConfigurationModel>>,
    ] = [
      this.attributeListService.getSelectedFeatureTypeName$(),
      this.attributeListService.getSelectedLayerId$(),
      this.attributeListService.getSelectedFeatureTypeFilter$(),
      this.applicationService.getFormConfigs$(),
    ];
    combineLatest(observables$)
      .pipe(
        take(1),
      )
      .subscribe(([ featureTypeName, layerId, filter, formConfigs ]) => {
        if (!featureTypeName) {
          return;
        }
        const appLayer = this.tailorMapService.getApplayerById(+(layerId));
        const tableName = appLayer.featureTypeName === featureTypeName && appLayer.userlayer
          ? appLayer.userlayer_original_feature_type_name
          : featureTypeName;
        const config = formConfigs.get(tableName);
        if (!config) {
          this.snackBar.open('Er is geen formulier beschikbaar voor deze objecten', 'Ok', { duration: 3000 });
          return;
        }
        // Create a dummy feature to show in the tree (name = config.name + count)
        const bulkEditFeature: Feature = {
          tableName,
          layerName: appLayer.layerName,
          relatedFeatureTypes: [],
          attributes: [
            {
              type: 'string',
              key: config.treeNodeColumn,
              value: `${config.name} (${this.totalCount})`,
            },
          ],
        };
        this.store$.dispatch(editFeatures({
          features: [ bulkEditFeature ],
          layerId,
          bulkEditFeatureTypeName: featureTypeName,
          bulkEditFilter: filter?.filter || '',
          bulkEditFilterType: filter?.filterType || 'cql',
        }));
      });
  }

  private getCheckedRowsAsFeatures$(): Observable<[ string, Feature[] ]> {
    const observables$: [ Observable<AttributeListRowModel[]>, Observable<string> ] = [
      this.attributeListService.getCheckedRows$(),
      this.attributeListService.getSelectedLayerId$(),
    ];
    return combineLatest(observables$)
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
                const uniqueFeatures = FeatureSelectionHelper.getUniqueFeatures(features);
                if (uniqueFeatures.length === 1) {
                  return uniqueFeatures;
                }
                // For bulk edit we don't want the relations to show up in the tree since it's not possible to open/edit them
                return uniqueFeatures.map<Feature>(feature => ({
                  ...feature,
                  children: [],
                  relatedFeatureTypes: [],
                }));
              }),
            ),
          ]);
        }),
      );
  }

}
