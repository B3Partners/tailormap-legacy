import { createSpyObject } from '@ngneat/spectator';
import { Observable, of } from 'rxjs';
import { ExportService } from '../export.service';
import { ExportFeaturesParameters } from '../export-models';
import { HttpResponse } from '@angular/common/http';

export const createExportServiceMockProvider = (overrides?: Partial<Record<keyof ExportService, any>>) => {
  return createSpyObject(ExportService, {
    exportFeatures$(params: ExportFeaturesParameters): Observable<HttpResponse<Blob>> {
      const blob = new Blob(['']);
      const response = new HttpResponse<Blob>({ body: blob });
      return of(response);
    },
    ...overrides,
  });
};

export const getExportServiceMockProvider = (overrides?: Partial<Record<keyof ExportService, any>>) => {
  return { provide: ExportService, useValue: createExportServiceMockProvider(overrides) };
};
