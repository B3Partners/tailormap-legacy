import { Injectable, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { AttributeListState } from '../state/attribute-list.state';
import { selectVisibleLayers } from '../../../application/state/application.selectors';
import { concatMap, filter, map, take, takeUntil, withLatestFrom } from 'rxjs/operators';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { selectAttributeListConfig, selectAttributeListTabs } from '../state/attribute-list.selectors';
import { changeAttributeListTabs } from '../state/attribute-list.actions';
import { AttributeListTabModel } from '../models/attribute-list-tab.model';
import { TailormapAppLayer } from '../../../application/models/tailormap-app-layer.model';
import { LayerUtils } from '../../../shared/layer-utils/layer-utils.service';
import { FormconfigRepositoryService } from '../../../shared/formconfig-repository/formconfig-repository.service';
import { MetadataService } from '../../../application/services/metadata.service';
import { AttributeListColumnModel } from '../models/attribute-list-column-models';
import { Attribute, FormConfiguration } from '../../../feature-form/form/form-models';
import { AttributeTypeHelper } from '../../../application/helpers/attribute-type.helper';
import { AttributeMetadataResponse } from '../../../shared/attribute-service/attribute-models';
import { AttributeListConfig } from '../models/attribute-list.config';
import { AttributeListFilterModel } from '../models/attribute-list-filter.model';

@Injectable({
  providedIn: 'root',
})
export class AttributeListManagerService implements OnDestroy {

  public static readonly EMPTY_ATTRIBUTE_LIST_TAB: AttributeListTabModel = {
    layerId: '',
    layerAlias: '',
    layerName: '',
    loadingData: false,
    columns: [],
    relatedFeatures: [],
    filter: [],
    rows: [],
    pageIndex: 0,
    pageSize: 10,
    totalCount: 0,
    sortDirection: 'ASC',
  };

  private destroyed = new Subject();

  constructor(
    private store$: Store<AttributeListState>,
    private formConfigRepoService: FormconfigRepositoryService,
    private metadataService: MetadataService,
  ) {
    this.store$.select(selectVisibleLayers)
      .pipe(
        takeUntil(this.destroyed),
        withLatestFrom(this.store$.select(selectAttributeListTabs), this.store$.select(selectAttributeListConfig)),
        concatMap(([ layers, tabs, config ]) => {
          const closedTabs = this.getClosedTabs(layers, tabs);
          const newTabs = this.getNewTabs(layers, tabs, config);
          return forkJoin([ of(closedTabs), newTabs ]);
        }),
        filter(([ closedTabs, newTabs ]) => closedTabs.length > 0 || newTabs.length > 0),
      )
      .subscribe(([ closedTabs, newTabs ]) => {
        this.store$.dispatch(changeAttributeListTabs({ newTabs, closedTabs }));
      });
  }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  private getClosedTabs(visibleLayers: TailormapAppLayer[], currentTabs: AttributeListTabModel[]): string[] {
    if (!currentTabs || currentTabs.length === 0) {
      return [];
    }
    return currentTabs
      .filter(tab => visibleLayers.findIndex(l => l.id === tab.layerId) === -1)
      .map<string>(tab => tab.layerId);
  }

  private getNewTabs(
    visibleLayers: TailormapAppLayer[],
    currentTabs: AttributeListTabModel[],
    attributeListConfig: AttributeListConfig,
  ): Observable<AttributeListTabModel[]> {
    if (!visibleLayers || visibleLayers.length === 0) {
      return of([]);
    }
    const layersWithoutTab = visibleLayers.filter(layer => currentTabs.findIndex(t => t.layerId === layer.id) === -1);
    if (layersWithoutTab.length === 0) {
      return of([]);
    }
    return forkJoin(layersWithoutTab.map<Observable<AttributeListTabModel>>(layer => {
      return this.createTabFromLayer(layer, attributeListConfig.pageSize)
    }));
  }

  private createTabFromLayer(layer: TailormapAppLayer, pageSize = 10): Observable<AttributeListTabModel> {
    const layerName = LayerUtils.sanitizeLayername(layer.layerName);
    return forkJoin([
      this.formConfigRepoService.getFormConfigForLayer$(layerName).pipe(take(1)),
      this.metadataService.getFeatureTypeMetadata$(layer.id),
    ]).pipe(
      map(([ formConfig, metadata ]) => {
        return {
          ...AttributeListManagerService.EMPTY_ATTRIBUTE_LIST_TAB,
          layerId: layer.id,
          layerAlias: layer.alias,
          layerName,
          columns: this.getColumnsForLayer(metadata, formConfig),
          filter: this.getFilters(metadata, +(layer.id)),
          pageSize,
        };
      }),
    );
  }

  private getColumnsForLayer(metadata: AttributeMetadataResponse, formConfig?: FormConfiguration): AttributeListColumnModel[] {
    const passportFields: Map<string, Attribute> = formConfig && formConfig.fields
      ? new Map(formConfig.fields.map(attr => [ attr.key, attr ]))
      : new Map();
    const attributes = metadata.attributes.filter(a => a.featureType === metadata.featureType);
    const attributeColumns = attributes.map<AttributeListColumnModel>(a => {
      const isPassportAttribute = passportFields.has(a.name);
      return {
        name: a.name,
        alias: isPassportAttribute ? passportFields.get(a.name).label : undefined,
        visible: isPassportAttribute,
        dataType: a.type,
        columnType: isPassportAttribute ? 'passport' : 'data',
        attributeType: AttributeTypeHelper.getAttributeType(a),
      };
    });
    return attributeColumns;
  }

  private getFilters(metadata: AttributeMetadataResponse, layerId: number): AttributeListFilterModel[] {
    return [
      this.getFilter(metadata.featureType, layerId),
      ...metadata.relations.map(relation => this.getFilter(relation.foreignFeatureType, layerId)),
    ];
  }

  private getFilter(featureTypeId: number, layerId: number): AttributeListFilterModel {
    return {
      featureTypeId,
      featureFilter: '',
      relatedFilter: '',
      valueFilter: '',
      filter: {
        columns: [],
        layerId,
      },
    };
  }

}
