import { createSpyObject } from '@ngneat/spectator';
import { MetadataService } from '../metadata.service';
import { Observable, of } from 'rxjs';
import { Attribute, AttributeMetadataResponse } from '../../../shared/attribute-service/attribute-models';

export const createMockProvider = () => {
  return createSpyObject(MetadataService, {
    getFeatureTypeMetadata$(layerId: string | number): Observable<AttributeMetadataResponse> {
      return of(null);
    },
    getPassportFieldsForLayer$(layerId: string | number): Observable<Attribute[]> {
      return of([]);
    },
  })
};

export const getMetadataServiceMockProvider = () => {
  return { provide: MetadataService, useValue: createMockProvider() };
};
