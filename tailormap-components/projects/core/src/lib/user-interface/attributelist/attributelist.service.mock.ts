import { createSpyObject } from '@ngneat/spectator';
import { AttributelistService } from './attributelist.service';
import { of } from 'rxjs';

export const createAttributelistServiceMock = () => createSpyObject(AttributelistService, {
  config: {
    pageSize: 100,
    zoomToBuffer: 5,
  },
  updateTreeData$: of([]),
  selectedTreeData$: of(undefined),
})

export const getAttributelistServiceMockProvider = () => {
  return { provide: AttributelistService, useValue: createAttributelistServiceMock() };
};
