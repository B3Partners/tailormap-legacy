import { createSpyObject } from '@ngneat/spectator';
import { of } from 'rxjs';
import { EditFeatureGeometryService } from '../edit-feature-geometry.service';

export const createEditFeatureGeometryServiceProvider = () => {
  return createSpyObject(EditFeatureGeometryService, {
    updateCurrentFeatureGeometry$() {
      return of(null);
    },
  })
}

export const getEditFeatureGeometryServiceProvider = () => {
  return { provide: EditFeatureGeometryService, useValue: createEditFeatureGeometryServiceProvider() };
};
