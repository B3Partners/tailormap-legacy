import { FeatureExtentService } from './feature-extent.service';
import { createHttpFactory, SpectatorService } from '@ngneat/spectator';
import { getTailorMapServiceMockProvider } from '../../../../../bridge/src/tailor-map.service.mock';

describe('FeatureExtentService', () => {
  let spectator: SpectatorService<FeatureExtentService>;
  const createService = createHttpFactory({
    service: FeatureExtentService,
    providers: [
      getTailorMapServiceMockProvider(),
    ],
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should be created', () => {
    expect(spectator).toBeTruthy();
  });
});
