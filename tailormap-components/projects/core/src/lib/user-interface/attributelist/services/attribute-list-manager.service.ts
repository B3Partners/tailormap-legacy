import { Injectable, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { AttributeListState } from '../state/attribute-list.state';
import { selectVisibleLayersWithAttributes } from '../../../application/state/application.selectors';
import { concatMap, filter, map, take, takeUntil, withLatestFrom } from 'rxjs/operators';
import { combineLatest, forkJoin, Observable, of, Subject } from 'rxjs';
import { selectAttributeListConfig, selectAttributeListTabs } from '../state/attribute-list.selectors';
import { changeAttributeListTabs } from '../state/attribute-list.actions';
import { AttributeListTabModel } from '../models/attribute-list-tab.model';
import { TailormapAppLayer } from '../../../application/models/tailormap-app-layer.model';
import { LayerUtils } from '../../../shared/layer-utils/layer-utils.service';
import { MetadataService } from '../../../application/services/metadata.service';
import { AttributeListColumnModel } from '../models/attribute-list-column-models';
import { Attribute, FormConfiguration } from '../../../feature-form/form/form-models';
import { AttributeTypeHelper } from '../../../application/helpers/attribute-type.helper';
import { AttributeMetadataResponse } from '../../../shared/attribute-service/attribute-models';
import { AttributeListConfig } from '../models/attribute-list.config';
import { AttributeListFeatureTypeData } from '../models/attribute-list-feature-type-data.model';
import { IdService } from '../../../shared/id-service/id.service';
import { selectFormConfigForFeatureTypeName, selectFormConfigsLoaded } from '../../../application/state/application.selectors';

interface TabFromLayerResult {
  tab: AttributeListTabModel;
  featureData: AttributeListFeatureTypeData[];
}

@Injectable({
  providedIn: 'root',
})
export class AttributeListManagerService implements OnDestroy {

  public static readonly EMPTY_ATTRIBUTE_LIST_TAB: AttributeListTabModel = {
    layerId: '',
    layerAlias: '',
    layerName: '',
    loadingData: false,
    featureType: 0,
    selectedRelatedFeatureType: 0,
    relatedFeatures: [],
  };

  public static readonly EMPTY_FEATURE_TYPE_DATA: AttributeListFeatureTypeData = {
    layerId: '',
    columns: [],
    showPassportColumnsOnly: true,
    featureType: 0,
    featureTypeName: '',
    filter: [],
    rows: [],
    checkedFeatures: [],
    pageIndex: 0,
    pageSize: 10,
    totalCount: null,
    sortDirection: 'ASC',
    statistics: [],
  };

  private destroyed = new Subject();

  constructor(
    private store$: Store<AttributeListState>,
    private metadataService: MetadataService,
    private idService: IdService,
  ) {
    combineLatest([
      this.store$.select(selectVisibleLayersWithAttributes),
      this.store$.select(selectFormConfigsLoaded),
    ])
      .pipe(
        takeUntil(this.destroyed),
        filter(([ layers, formConfigLoaded ]) => !!formConfigLoaded),
        map(([ layers, formConfigLoaded ]) => layers),
        withLatestFrom(this.store$.select(selectAttributeListTabs), this.store$.select(selectAttributeListConfig)),
        concatMap(([ layers, tabs, config ]) => {
          const closedTabs = this.getClosedTabs(layers, tabs);
          const newTabs$ = this.getNewTabs$(layers, tabs, config);
          return forkJoin([ of(closedTabs), newTabs$ ]);
        }),
        filter(([ closedTabs, newTabs ]) => closedTabs.length > 0 || newTabs.length > 0),
      )
      .subscribe(([ closedTabs, newTabs ]) => {
        this.store$.dispatch(changeAttributeListTabs({
          newTabs: newTabs.map(result => result.tab),
          newFeatureData: newTabs.reduce((featureData, result) => featureData.concat(...result.featureData), []),
          closedTabs,
        }));
      });
  }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  private getClosedTabs(visibleLayers: TailormapAppLayer[], currentTabs: AttributeListTabModel[]): number[] {
    if (!currentTabs || currentTabs.length === 0) {
      return [];
    }
    return currentTabs
      .filter(tab => visibleLayers.findIndex(l => l.id === tab.layerId) === -1)
      .map<number>(tab => tab.featureType);
  }

  private getNewTabs$(
    visibleLayers: TailormapAppLayer[],
    currentTabs: AttributeListTabModel[],
    attributeListConfig: AttributeListConfig,
  ): Observable<TabFromLayerResult[]> {
    if (!visibleLayers || visibleLayers.length === 0) {
      return of([]);
    }
    const layersWithoutTab = visibleLayers.filter(layer => currentTabs.findIndex(t => t.layerId === layer.id) === -1);
    if (layersWithoutTab.length === 0) {
      return of([]);
    }
    return forkJoin(layersWithoutTab.map<Observable<TabFromLayerResult>>(layer => {
      return this.createTabFromLayer$(layer, attributeListConfig.pageSize);
    }));
  }

  private createTabFromLayer$(
    layer: TailormapAppLayer,
    pageSize = 10,
  ): Observable<TabFromLayerResult> {
    const layerName = LayerUtils.sanitizeLayername(layer);
    return forkJoin([
      this.store$.select(selectFormConfigForFeatureTypeName, layerName).pipe(take(1)),
      this.metadataService.getFeatureTypeMetadata$(layer.id),
    ]).pipe(
      map(([ formConfig, metadata ]): TabFromLayerResult => {
        const tab: AttributeListTabModel = {
          ...AttributeListManagerService.EMPTY_ATTRIBUTE_LIST_TAB,
          layerId: layer.id,
          layerAlias: layer.alias,
          layerName,
          featureType: metadata.featureType,
          selectedRelatedFeatureType: metadata.featureType,
          relatedFeatures: metadata.relations || [],
        };
        const featureData: AttributeListFeatureTypeData[] = [
          this.createDataForFeatureType(
            metadata.featureType,
            layer.alias || layerName,
            metadata.featureType,
            pageSize,
            layer.id,
            metadata,
            formConfig,
          ),
          ...(metadata.relations || []).map(featureType => {
            return this.createDataForFeatureType(
              featureType.foreignFeatureType,
              featureType.foreignFeatureTypeName,
              metadata.featureType,
              pageSize,
              layer.id,
              metadata,
              formConfig,
            );
          }),
        ];
        return { tab, featureData };
      }),
    );
  }

  private createDataForFeatureType(
    featureType: number,
    featureTypeName: string,
    parentFeatureType: number,
    pageSize: number,
    layerId: string,
    metadata: AttributeMetadataResponse,
    formConfig?: FormConfiguration,
  ): AttributeListFeatureTypeData {
    return {
      ...AttributeListManagerService.EMPTY_FEATURE_TYPE_DATA,
      layerId,
      featureType,
      featureTypeName,
      parentFeatureType: featureType !== parentFeatureType ? parentFeatureType : undefined,
      columns: this.getColumnsForLayer(metadata, featureType, formConfig),
      showPassportColumnsOnly: !!formConfig,
      pageSize,
    };
  }

  private getColumnsForLayer(
    metadata: AttributeMetadataResponse,
    featureType: number,
    formConfig?: FormConfiguration,
  ): AttributeListColumnModel[] {
    const passportFields: Map<string, Attribute> = formConfig && formConfig.fields
      ? new Map(formConfig.fields.map(attr => [ attr.key, attr ]))
      : new Map();
    const attributes = metadata.attributes.filter(a => a.visible && a.featureType === featureType);
    return attributes.map<AttributeListColumnModel>(a => {
      const isPassportAttribute = passportFields.has(a.name);
      return {
        id: this.idService.getUniqueId('column'),
        name: a.name,
        alias: isPassportAttribute ? passportFields.get(a.name).label : undefined,
        visible: true,
        dataType: a.type,
        columnType: isPassportAttribute ? 'passport' : 'data',
        attributeType: AttributeTypeHelper.getAttributeType(a),
      };
    });
  }

}
