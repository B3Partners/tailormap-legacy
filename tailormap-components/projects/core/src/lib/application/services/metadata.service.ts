import { Injectable, OnDestroy } from '@angular/core';
import { AttributeService } from '../../shared/attribute-service/attribute.service';
import { Store } from '@ngrx/store';
import { ApplicationState } from '../state/application.state';
import { selectApplicationId } from '../state/application.selectors';
import { concatMap, map, switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { AttributeListParameters, AttributeListResponse, AttributeMetadataResponse } from '../../shared/attribute-service/attribute-models';
import { FormconfigRepositoryService } from '../../shared/formconfig-repository/formconfig-repository.service';
import { Attribute as GbiAttribute } from '../../feature-form/form/form-models';
import { PassportAttributeModel } from '../models/passport-attribute.model';
import { UniqueValuesResponse } from '../../shared/value-service/value-models';
import { ValueService } from '../../shared/value-service/value.service';

export type UniqueValueCountResponse = { uniqueValue: string, total: number };

@Injectable({
  providedIn: 'root',
})
export class MetadataService implements OnDestroy {

  private destroy = new Subject();

  private attributeCache: Map<string, AttributeMetadataResponse> = new Map();

  constructor(
    private store$: Store<ApplicationState>,
    private attributeService: AttributeService,
    private formConfigService: FormconfigRepositoryService,
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
          }))
        }),
      )
  }

  public getPassportFieldsForLayer$(layerId: string | number): Observable<PassportAttributeModel[]> {
    return this.getFeatureTypeMetadata$(layerId)
      .pipe(
        switchMap(metadata => {
          const formConfigs$ = [
            ...metadata.relations.map(relation => relation.foreignFeatureTypeName),
            ...metadata.invertedRelations.map(invertedRelation => invertedRelation.featureTypeName),
          ].map(relation => this.formConfigService.getFormConfigForLayer$(relation));
          return combineLatest([
            of(metadata),
            this.formConfigService.getFormConfigForLayer$(metadata.featureTypeName),
            combineLatest(formConfigs$),
          ]);
        }),
        map(([ metadata, formConfig, relationFormConfigs ]) => {
          if (!formConfig.fields) {
            return [];
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
            .filter(attribute => availableFields.has(attribute.name))
            .map<PassportAttributeModel>(attribute => ({ ...attribute, passportAlias: availableFields.get(attribute.name).label }));
        }),
      );
  }

  public getUniqueValuesAndTotalForAttribute$(
    appLayerId: number,
    passportAttribute: PassportAttributeModel,
  ): Observable<UniqueValueCountResponse[]> {
    const attribute: PassportAttributeModel = { ...passportAttribute };
    const appLayer = appLayerId;
    return this.valueService.uniqueValues$({ applicationLayer: appLayerId, attributes: [ passportAttribute.name ] })
      .pipe(
        switchMap((uniqueValuesResponse: UniqueValuesResponse) => {
          if (!uniqueValuesResponse.uniqueValues
            || !uniqueValuesResponse.uniqueValues.hasOwnProperty(attribute.name)
            || !Array.isArray(uniqueValuesResponse.uniqueValues[attribute.name])) {
            return of([]);
          }
          const featureInfoRequests$ = uniqueValuesResponse.uniqueValues[attribute.name].map(value => {
            return this.getTotalFeaturesForQuery$(appLayer, `${attribute.name} = '${value}'`)
              .pipe(
                // Merge both total and unique value into 1 result
                map<number, UniqueValueCountResponse>(total => ({ uniqueValue: value, total })),
              );
          });
          return combineLatest(featureInfoRequests$)
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
          });
        }),
        map<AttributeListResponse, number>(response => response.total),
      );
  }

  public ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }

}
