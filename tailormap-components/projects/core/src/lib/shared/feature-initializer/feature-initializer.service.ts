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
import { FeatureUpdateHelper } from './feature-update.helper';


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
          const feature = FeatureUpdateHelper.updateFeatureAttributes(
            this.createFeature(config, type),
            params,
            true,
          );
          if (!!geometry) {
            // @TODO: check if this is indeed needed
            // The hard-coded 'geometrie' field name is probably needed for backwards compatibility.
            // Older versions / incorrect configured features might expect the 'geometrie' field to be filled with the geometry.
            // Should be configured in `featuretypeMetadata` though
            const geomKey = config.featuretypeMetadata ? config.featuretypeMetadata.geometryAttribute : 'geometrie';
            const geomType = config.featuretypeMetadata ? config.featuretypeMetadata.geometryType : 'GEOMETRY';
            feature.attributes = FeatureUpdateHelper.addOrReplaceAttributeValue({
              attributes: feature.attributes,
              key: geomKey,
              allowToAddProperties: true,
              value: geometry,
              type: geomType,
            });
          }
          return feature;
        }),
      );
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

}
