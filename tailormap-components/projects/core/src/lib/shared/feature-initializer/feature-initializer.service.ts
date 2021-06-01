/* eslint @typescript-eslint/naming-convention: [ "error", { "selector": ["objectLiteralProperty","classProperty"], "format": ["camelCase", "UPPER_CASE", "snake_case"] } ] */

import { Injectable, OnDestroy } from '@angular/core';
import { Feature } from '../generated';
import { FormHelpers } from '../../feature-form/form/form-helpers';
import * as wellknown from 'wellknown';
import { GeoJSONGeometry } from 'wellknown';
import { Store } from '@ngrx/store';
import { ApplicationState } from '../../application/state/application.state';
import { selectFormConfigForFeatureTypeName } from '../../application/state/application.selectors';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
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

  public create(type: string, params: any): Observable<Feature> {
    params.clazz = type.toLowerCase();
    params.objecttype = FormHelpers.snakecaseToCamel(type);
    params.fid = FeatureInitializerService.STUB_OBJECT_GUID_NEW_OBJECT;
    return this.store$.select(selectFormConfigForFeatureTypeName, type)
      .pipe(takeUntil(this.destroyed),
      map((config :FormConfiguration) => {
        const feature :Feature = {
          relatedFeatureTypes:[],
          clazz: type.toLowerCase(),
          fid: FeatureInitializerService.STUB_OBJECT_GUID_NEW_OBJECT,
        };
        feature.attributes = config.fields.map(attr => {
          return {
            key: attr.key,
            type: attr.type,
          };
        });
        feature.attributes.push({
          key: config.featuretypeMetadata.geometryAttribute,
          type: config.featuretypeMetadata.geometryType,
          value: params.geometrie
        })
        return feature;
      }));
  }
}
