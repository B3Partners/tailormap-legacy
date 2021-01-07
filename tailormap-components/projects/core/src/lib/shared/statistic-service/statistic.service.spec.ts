import { StatisticService } from './statistic.service';
import { createHttpFactory, SpectatorService } from '@ngneat/spectator';
import { getTailorMapServiceMockProvider } from '../../../../../bridge/src/tailor-map.service.mock';

describe('StatisticService', () => {
  let spectator: SpectatorService<StatisticService>;
  const createService = createHttpFactory({
    service: StatisticService,
    providers: [
      getTailorMapServiceMockProvider(),
    ],
  })

  beforeEach(() => {
    spectator = createService();
  });

  it('should be created', () => {
    expect(spectator).toBeTruthy();
  });
});
