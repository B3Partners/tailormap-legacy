import { AttributeService } from './attribute.service';
import { createHttpFactory, SpectatorService } from '@ngneat/spectator';
import { getTailorMapServiceMockProvider } from '../../../../../bridge/src/tailor-map.service.mock';

describe('AttributeService', () => {
  let spectator: SpectatorService<AttributeService>;
  const createService = createHttpFactory({
    service: AttributeService,
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
