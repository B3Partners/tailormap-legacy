import { TestBed } from '@angular/core/testing';

import { HighlightService } from './highlight.service';
import { createHttpFactory, SpectatorService } from '@ngneat/spectator';
import { getTailorMapServiceMockProvider } from '../../../../../bridge/src/tailor-map.service.mock';

describe('HighlightService', () => {
  let spectator: SpectatorService<HighlightService>;
  const createService = createHttpFactory({
    service: HighlightService,
    providers: [
      getTailorMapServiceMockProvider(),
    ]
  });

  beforeEach(() => spectator = createService());

  it('should be created', () => {
    expect(spectator).toBeTruthy();
  });
});
