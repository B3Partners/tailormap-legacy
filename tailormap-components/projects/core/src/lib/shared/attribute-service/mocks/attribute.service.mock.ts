import { createSpyObject } from '@ngneat/spectator';
import { AttributeService } from '../attribute.service';
import {
  Attribute,
  AttributeListParameters, AttributeListResponse, AttributeMetadataParameters, AttributeMetadataResponse,
} from '../attribute-models';
import { Observable, of } from 'rxjs';

const mockedAttributeListResponse: AttributeListResponse = {
  total: 0,
  features: [],
  success: true,
};

const geomAttribute: Attribute = {
  allowValueListOnly: false,
  automaticValue: false,
  defaultValue: '',
  disableUserEdit: false,
  disallowNullValue: false,
  editAlias: '',
  editHeight: '',
  editable: false,
  filterable: false,
  folder_label: '',
  id: 0,
  longname: 'geometry',
  selectable: false,
  valueList: '',
  visible: false,
  featureType: 1,
  name: 'geom',
  type: 'geometry',
}

const mockAttributeMetadataResponse: AttributeMetadataResponse = {
  featureType: 1,
  attributes: [ geomAttribute ],
  relations: [],
  invertedRelations: [],
  featureTypeName: 'feature',
  geometryAttribute: 'geom',
  geometryAttributeIndex: 0,
  success: true,
}

export const createAttributeServiceMock = (template?: Partial<Record<keyof AttributeService, any>>) => {
  return createSpyObject(AttributeService, {
    features$(params: AttributeListParameters): Observable<AttributeListResponse> {
      return of(mockedAttributeListResponse)
    },
    featureTypeMetadata$(params: AttributeMetadataParameters): Observable<AttributeMetadataResponse> {
      return of(mockAttributeMetadataResponse);
    },
    ...template,
  })
};

export const getAttributeServiceMockProvider = (template?: Partial<Record<keyof AttributeService, any>>) => {
  return { provide: AttributeService, useValue: createAttributeServiceMock(template) };
};
