import { createSpyObject } from '@ngneat/spectator';
import { AttributeListManagerService } from '../attribute-list-manager.service';

export const createAttributeListManagerServiceMockProvider = (overrides?: Partial<Record<keyof AttributeListManagerService, any>>) => {
  return createSpyObject(AttributeListManagerService, {
    ...overrides,
  })
};

export const getAttributeListManagerServiceMockProvider = (overrides?: Partial<Record<keyof AttributeListManagerService, any>>) => {
  return { provide: AttributeListManagerService, useValue: createAttributeListManagerServiceMockProvider(overrides) };
};
