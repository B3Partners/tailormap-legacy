import { Injectable, OnDestroy } from '@angular/core';
import { AttributeService } from '../../shared/attribute-service/attribute.service';
import { Store } from '@ngrx/store';
import { ApplicationState } from '../state/application.state';
import { selectApplicationId, selectFormConfigForFeatureTypeName } from '../state/application.selectors';
import { catchError, concatMap, map, switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { AttributeListParameters, AttributeListResponse, AttributeMetadataResponse } from '../../shared/attribute-service/attribute-models';
import { Attribute as GbiAttribute, FormConfiguration } from '../../feature-form/form/form-models';
import { ExtendedAttributeModel } from '../models/extended-attribute.model';
import { UniqueValuesResponse } from '../../shared/value-service/value-models';
import { ValueService } from '../../shared/value-service/value.service';
import { FormState } from '../../feature-form/state/form.state';

export type UniqueValueCountResponse = { uniqueValue: string; total: number };

@Injectable({
  providedIn: 'root',
})
export class MetadataService implements OnDestroy {

  private destroy = new Subject();

  private attributeCache: Map<string, AttributeMetadataResponse> = new Map();

  constructor(
    private store$: Store<ApplicationState | FormState>,
    private attributeService: AttributeService,
    private valueService: ValueService,
  ) {
    this.store$.select(selectApplicationId)
      .pipe(takeUntil(this.destroy))
      .subscribe(appId => {
        this.attributeCache = new Map();
      });
  }

  public getFeatureTypeMetadata$(layerId: string | number): Observable<AttributeMetadataResponse> {
    if (this.attributeCache.has(`${layerId}`)) {
      return of(this.attributeCache.get(`${layerId}`));
    }
    return this.store$.select(selectApplicationId)
      .pipe(
        takeWhile(appId => appId === null, true),
        switchMap(application => {
          return this.attributeService.featureTypeMetadata$({
            application,
            appLayer: +(layerId),
          }).pipe(tap(result => {
            if (result.success) {
              this.attributeCache.set(`${layerId}`, result);
            }
          }));
        }),
      );
  }

  public getVisibleExtendedAttributesForLayer$(layerId: string | number): Observable<ExtendedAttributeModel[]> {
    return this.getFeatureTypeMetadata$(layerId)
      .pipe(
        switchMap(metadata => {
          const formConfigs$ = [
            ...metadata.relations.map(relation => relation.foreignFeatureTypeName),
            ...metadata.invertedRelations.map(invertedRelation => invertedRelation.featureTypeName),
          ].map(relation => this.store$.select(selectFormConfigForFeatureTypeName, relation));
          return combineLatest([
            of(metadata),
            this.store$.select(selectFormConfigForFeatureTypeName, metadata.featureTypeName),
            formConfigs$.length ? combineLatest(formConfigs$) : of([]),
          ]);
        }),
        map(([ metadata, formConfig, relationFormConfigs ]: [ AttributeMetadataResponse, FormConfiguration, FormConfiguration[] ]) => {
          if (!formConfig || !formConfig.fields) {
            return metadata.attributes
              .filter(a => a.visible)
              .map<ExtendedAttributeModel>(attribute => ({ ...attribute, alias: attribute.name }));
          }
          const availableFields = new Map<string, GbiAttribute>();
          formConfig.fields.forEach(f => availableFields.set(f.key, f));
          relationFormConfigs.forEach(config => {
            if (!config || !config.fields) {
              return;
            }
            config.fields.forEach(f => availableFields.set(f.key, f));
          });
          return metadata.attributes
            .filter(attribute => availableFields.has(attribute.name) && attribute.visible)
            .map<ExtendedAttributeModel>(attribute => ({ ...attribute, alias: availableFields.get(attribute.name).label }));
        }),
      );
  }

  public getUniqueValuesAndTotalForAttribute$(
    appLayerId: number,
    attribute: ExtendedAttributeModel,
  ): Observable<UniqueValueCountResponse[]> {
    const attributeModel: ExtendedAttributeModel = { ...attribute };
    const appLayer = appLayerId;
    return this.valueService.uniqueValues$({ applicationLayer: appLayerId, attributes: [ attributeModel.name ] })
      .pipe(
        switchMap((uniqueValuesResponse: UniqueValuesResponse) => {
          if (!uniqueValuesResponse.uniqueValues
            || !uniqueValuesResponse.uniqueValues.hasOwnProperty(attributeModel.name)
            || !Array.isArray(uniqueValuesResponse.uniqueValues[attributeModel.name])) {
            return of([]);
          }
          const featureInfoRequests$ = uniqueValuesResponse.uniqueValues[attributeModel.name].map(value => {
            return this.getTotalFeaturesForQuery$(appLayer, `${attributeModel.name} = '${value}'`)
              .pipe(
                // Merge both total and unique value into 1 result
                map<number, UniqueValueCountResponse>(total => ({ uniqueValue: value, total })),
              );
          });
          return combineLatest(featureInfoRequests$);
        }),
      );
  }

  public getTotalFeaturesForQuery$(appLayer: number, query: string, featureType?: number): Observable<number> {
    return this.store$.select(selectApplicationId)
      .pipe(
        takeWhile(appId => appId === null, true),
        concatMap(application => {
          const featureParams: AttributeListParameters = {
            appLayer,
            application,
            limit: 1,
            clearTotalCountCache: true,
          };
          if (featureType) {
            featureParams.featureType = featureType;
          }
          return this.attributeService.features$({
            ...featureParams,
            filter: query,
          }).pipe(
            catchError(e => of({ total: 0, success: false })),
          );
        }),
        map<AttributeListResponse, number>(response => {
          if (response.success) {
            return response.total;
          }
          return 0;
        }),
      );
  }

  public getUniqueValuesForAttribute$(
    appLayerId: string,
    attributeName: string,
    featureType: number,
  ): Observable<UniqueValuesResponse> {
    return this.valueService.uniqueValues$({
      applicationLayer: Number(appLayerId),
      attributes: [attributeName],
      featureType,
      maxFeatures: -1,
    });
  }

  public ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }

}
