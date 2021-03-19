import { ValueService } from './value.service';
import { createHttpFactory, SpectatorService } from '@ngneat/spectator';
import { getTailorMapServiceMockProvider } from '../../../../../bridge/src/tailor-map.service.mock';

describe('ValueService', () => {
  let spectator: SpectatorService<ValueService>;
  const createService = createHttpFactory({
    service: ValueService,
    providers: [
      getTailorMapServiceMockProvider(),
    ],
  });

  beforeEach(() => spectator = createService());

  it('should be created', () => {
    expect(spectator).toBeTruthy();
  });
});
