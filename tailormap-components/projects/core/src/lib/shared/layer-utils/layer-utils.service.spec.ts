import { LayerUtils } from './layer-utils.service';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { getTailorMapServiceMockProvider } from '../../../../../bridge/src/tailor-map.service.mock';
import { AppLayer } from '../../../../../bridge/typings';
import { appLayerMock, getVisibleLayerMocks, viewerControllerMock } from '../tests/test-data';
import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';


describe('LayerUtilsService', () => {
  let spectator: SpectatorService<LayerUtils>;

  const vcMock = viewerControllerMock({
    getVisibleLayers: getVisibleLayerMocks([1]),
    getAppLayerById(id: number): AppLayer {
      return {
        alias: '', attribute: false,featureTypeName: 'aap',background: false, featureType: 0, id: '1', layerId: 1, layerName: 'aap', userlayer: true, editable: true,
      };
    },
  });

  let tailorMapSpy: TailorMapService;
  const tailorMapServiceMock = getTailorMapServiceMockProvider({
    getViewerController: () => vcMock,
  });

  const createService = createServiceFactory({
      service: LayerUtils,
      providers: [
        tailorMapServiceMock,
      ],
    });

  beforeEach(() => {
    spectator = createService();
    tailorMapSpy = spectator.inject(TailorMapService);
    tailorMapSpy.getViewerController = () => vcMock;
  });

  it('should be created', () => {
    expect(spectator).toBeTruthy();
  });


  it('should return getfeaturetypesallows', () => {
    const result = spectator.service.getFeatureTypesAllowed([
      'aap',
      'noot',
    ]);
    expect(result).toEqual(['aap']);
  });

  it('should return all features if useSelectedLayerFilter is false', () => {
    tailorMapSpy.getViewerController = () => viewerControllerMock({
      getVisibleLayers: getVisibleLayerMocks([1, 2]),
      getAppLayerById(id: number): AppLayer {
        return {
          alias: '', attribute: false, background: false, featureType: 0, id: '1', layerId: 1,
          featureTypeName: id === 2 ? 'noot' : 'aap', layerName: id === 2 ? 'noot' : 'aap', userlayer: false, editable: true,
        };
      },
    });
    const result = spectator.service.getFeatureTypesAllowed([
      'aap',
      'noot',
    ]);
    expect(result).toEqual(['aap', 'noot']);
  });
});
