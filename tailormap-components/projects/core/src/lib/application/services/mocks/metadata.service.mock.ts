import { createSpyObject } from '@ngneat/spectator';
import { MetadataService } from '../metadata.service';
import { Observable, of } from 'rxjs';
import { Attribute, AttributeMetadataResponse } from '../../../shared/attribute-service/attribute-models';
import { METADATA_SERVICE } from '@tailormap/api';

export const createMockProvider = (template?: Partial<Record<keyof MetadataService, any>>) => {
  return createSpyObject(MetadataService, {
    getFeatureTypeMetadata$(layerId: string | number): Observable<AttributeMetadataResponse> {
      return of(null);
    },
    getVisibleExtendedAttributesForLayer$(layerId: string | number): Observable<Attribute[]> {
      return of([]);
    },
    getUniqueValuesForAttribute$(): Observable<string[]> {
      return of([]);
    },
    ...template,
  });
};

export const getMetadataServiceMockProvider = (template?: Partial<Record<keyof MetadataService, any>>) => {
  return { provide: METADATA_SERVICE, useValue: createMockProvider(template) };
};
