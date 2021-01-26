import { LayerUtils } from './layer-utils.service';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { getTailorMapServiceMockProvider } from '../../../../../bridge/src/tailor-map.service.mock';
import { AppLayer } from '../../../../../bridge/typings';
import { appLayerMock, getVisibleLayerMocks, viewerControllerMock } from '../tests/test-data';


describe('LayerUtilsService', () => {
  let spectator: SpectatorService<LayerUtils>;

  const vcMock = viewerControllerMock({
    getVisibleLayers: getVisibleLayerMocks([1]),
    getAppLayerById(id: number): AppLayer {
      return {
        alias: '', attribute: false, background: false, featureType: 0, id: '1', layerId: 1, layerName: 'aap', userlayer: true,
      };
    },
  });
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
  });

  it('should be created', () => {
    expect(spectator).toBeTruthy();
  });


  it('should return getfeaturetypesallows', () => {
    let result = spectator.service.getFeatureTypesAllowed([
      'aap',
      'noot'
    ]);
    expect(result).toEqual(['ul_1']);
  });


  it('should return correct userlayername', () => {
    let userLayer : AppLayer = appLayerMock({userlayer : true});

    let result = spectator.service.getLayerName(userLayer)
    expect(result).toEqual('ul_1');
  });

  it('should return correct layername', () => {
    let normallayer : AppLayer = appLayerMock({userlayer : false, layerName: 'gb_wegvakonderdeel'});

    let result = spectator.service.getLayerName(normallayer)
    expect(result).toEqual('wegvakonderdeel');
  });
});
