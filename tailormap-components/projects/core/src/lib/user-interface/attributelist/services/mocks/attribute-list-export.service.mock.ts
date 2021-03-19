import { createSpyObject } from '@ngneat/spectator';
import { AttributeListExportService, ExportType } from '../attribute-list-export.service';

export const createAttributeListExportServiceMockProvider = (overrides?: Partial<Record<keyof AttributeListExportService, any>>) => {
  return createSpyObject(AttributeListExportService, {
    createAttributeListExport(format: ExportType, layerId: string, featureType: number): void {},
    ...overrides,
  });
};

export const getAttributeListExportServiceMockProvider = (overrides?: Partial<Record<keyof AttributeListExportService, any>>) => {
  return { provide: AttributeListExportService, useValue: createAttributeListExportServiceMockProvider(overrides) };
};
