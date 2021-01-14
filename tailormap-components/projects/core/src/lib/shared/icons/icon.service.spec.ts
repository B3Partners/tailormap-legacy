import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { IconService } from './icon.service';

describe('IconService', () => {
  let spectator: SpectatorService<IconService>;
  const createService = createServiceFactory(IconService);

  beforeEach(() => spectator = createService());

  it('should...', () => {
    expect(spectator.service).toBeTruthy();
  });
});
