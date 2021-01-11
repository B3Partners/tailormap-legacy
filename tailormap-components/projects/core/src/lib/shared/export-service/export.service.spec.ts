import { ExportService } from './export.service';
import { createHttpFactory, SpectatorService } from '@ngneat/spectator';
import { getTailorMapServiceMockProvider } from '../../../../../bridge/src/tailor-map.service.mock';

describe('ExportService', () => {
  let spectator: SpectatorService<ExportService>;
  const createService = createHttpFactory({
    service: ExportService,
    providers: [
      getTailorMapServiceMockProvider(),
    ]
  });
  beforeEach(() => {
    spectator = createService();
  });

  it('should be created', () => {
    expect(spectator).toBeTruthy();
  });
});
