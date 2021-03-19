import { GeometryConfirmService } from './geometry-confirm.service';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { getTailorMapServiceMockProvider } from '../../../../../bridge/src/tailor-map.service.mock';

describe('GeometryConfirmService', () => {
  let spectator: SpectatorService<GeometryConfirmService>;
  const createService = createServiceFactory({
    service: GeometryConfirmService,
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
