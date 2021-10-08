import { Injectable } from '@angular/core';
import { Feature, Field } from '../generated';
import * as wellknown from 'wellknown';
import { GeoJSONGeometry } from 'wellknown';
import { Store } from '@ngrx/store';
import { ApplicationState } from '../../application/state/application.state';
import { selectFormConfigForFeatureTypeName } from '../../application/state/application.selectors';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { ExtendedFormConfigurationModel } from '../../application/models/extended-form-configuration.model';
import { FormConfiguration } from '../../feature-form/form/form-models';


@Injectable({
  providedIn: 'root',
})
export class FeatureInitializerService {

  public static enum;

  public static readonly STUB_OBJECT_GUID_NEW_OBJECT = '-1';

  constructor(
    private store$: Store<ApplicationState>) {
  }

  public retrieveGeometry(feature: Feature): GeoJSONGeometry {
    const wkt = feature.defaultGeometry;
    if (wkt != null) {
      return wellknown.parse(wkt);
    }
    return null;
  }

  public create$(type: string, params: Record<string, any>, geometry?: string): Observable<Feature> {
    return this.store$.select(selectFormConfigForFeatureTypeName, type)
      .pipe(
        take(1),
        map((config: ExtendedFormConfigurationModel) => {
          if (!config) {
            throw new Error('Featuretype not implemented: ' + type);
          }
          const feature = this.createFeature(config, type);
          Object.keys(params).forEach(key => {
            feature.attributes = this.addOrReplaceAttributeValue(feature.attributes, key, params[key]);
          });
          if (!!geometry) {
            // @TODO: check if this is indeed needed
            // The hard-coded 'geometrie' field name is probably needed for backwards compatibility.
            // Older versions / incorrect configured features might expect the 'geometrie' field to be filled with the geometry.
            // Should be configured in `featuretypeMetadata` though
            const geomKey = config.featuretypeMetadata ? config.featuretypeMetadata.geometryAttribute : 'geometrie';
            const geomType = config.featuretypeMetadata ? config.featuretypeMetadata.geometryType : 'GEOMETRY';
            feature.attributes = this.addOrReplaceAttributeValue(feature.attributes, geomKey, geometry, geomType);
          }
          return feature;
        }),
      );
  }

  private addOrReplaceAttributeValue(attributes: Field[], key: string, value?: string | number | null, type?: string ): Field[] {
    const idx = attributes.findIndex(a => a.key === key);
    if (idx === -1) {
      return [ ...attributes, { key, value, type }];
    }
    return [
      ...attributes.slice(0, idx),
      {
        ...attributes[idx],
        value,
      },
      ...attributes.slice(idx + 1),
    ];
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
