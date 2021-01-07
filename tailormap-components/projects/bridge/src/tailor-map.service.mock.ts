import { createSpyObject } from '@ngneat/spectator';
import { TailorMapService } from './tailor-map.service';
import { AppLayer, MapComponent, ViewerController } from '../typings';
import { appLayerMock, mapComponentMock, viewerControllerMock } from '../../core/src/lib/shared/tests/test-data';
import { of } from 'rxjs';

export const createTailormapServiceMockProvider = () => {
  return createSpyObject(TailorMapService, {
    extentChanged$: of({ extent: { minx: 1, miny: 1, maxx: 2, maxy: 2 }}),
    layerVisibilityChanged$: of({ visible: true, layer: { id: 1 }}),
    getApplayerById(id: number): AppLayer {
      return appLayerMock();
    },
    getContextPath(): string {
      return '/viewer';
    },
    getMapComponent(): MapComponent {
      return mapComponentMock();
    },
    getViewerController(): ViewerController {
      return viewerControllerMock();
    },
  })
};

export const getTailorMapServiceMockProvider = () => {
  return { provide: TailorMapService, useValue: createTailormapServiceMockProvider() };
};
