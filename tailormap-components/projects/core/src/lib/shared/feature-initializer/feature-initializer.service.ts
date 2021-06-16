/* eslint @typescript-eslint/naming-convention: [ "error", { "selector": ["objectLiteralProperty","classProperty"], "format": ["camelCase", "UPPER_CASE", "snake_case"] } ] */

import { Injectable, OnDestroy } from '@angular/core';
import { Feature } from '../generated';
import * as wellknown from 'wellknown';
import { GeoJSONGeometry } from 'wellknown';
import { Store } from '@ngrx/store';
import { ApplicationState } from '../../application/state/application.state';
import { selectFormConfigForFeatureTypeName } from '../../application/state/application.selectors';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { ExtendedFormConfigurationModel } from '../../application/models/extended-form-configuration.model';
import { FormConfiguration } from '../../feature-form/form/form-models';


@Injectable({
  providedIn: 'root',
})
export class FeatureInitializerService implements OnDestroy {

  public static enum;
  private destroyed = new Subject();

  public static readonly STUB_OBJECT_GUID_NEW_OBJECT = '-1';

  constructor(
    private store$: Store<ApplicationState>) {
  }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public retrieveGeometry(feature: Feature): GeoJSONGeometry {
    const wkt = feature.defaultGeometry;
    if (wkt != null) {
      return wellknown.parse(wkt);
    }
    return null;
  }

  public create$(type: string, params: any): Observable<Feature> {
    return this.store$.select(selectFormConfigForFeatureTypeName, type)
      .pipe(takeUntil(this.destroyed),
      map((config: ExtendedFormConfigurationModel) => {
        if (!config) {
          throw new Error('Featuretype not implemented: ' + type);
        }

        const feature = this.createFeature(config, type);

        for(const key in params){
          if(params.hasOwnProperty(key)){
            feature.attributes.push({
              key,
              value: params[key],
            });
          }
        }
        if (config.featuretypeMetadata) {
          feature.attributes.push({
            key: config.featuretypeMetadata.geometryAttribute,
            type: config.featuretypeMetadata.geometryType,
            value: params.geometrie,
          });
        }
        return feature;
      }));
  }

  private createFeature(config: FormConfiguration, type: string): Feature{
    const feature: Feature = {
      relatedFeatureTypes: [],
      tableName: type.toLowerCase(),
      fid: FeatureInitializerService.STUB_OBJECT_GUID_NEW_OBJECT,
    };
    feature.attributes = config.fields.map(attr => {
      return {
        key: attr.key,
        type: attr.type,
      };
    });
    return feature;
  }

  public convertOldToNewFeature(feature: Feature, formConfig: FormConfiguration): Feature{
    const newF = this.createFeature(formConfig, feature.tableName);
    for (const key in newF){
      if(newF.hasOwnProperty(key) && key !== 'attributes'){
        newF[key] = feature[key];
      }
    }
    newF.attributes.forEach(attr=>{
      attr.value = feature[attr.key];
    });

    return newF;
  }

}
