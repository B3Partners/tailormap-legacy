import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { AttributeListManagerService } from './attribute-list-manager.service';

describe('AttributeListManagerService', () => {
  let spectator: SpectatorService<AttributeListManagerService>;
  const createService = createServiceFactory(AttributeListManagerService);

  beforeEach(() => spectator = createService());

  it('should...', () => {
    expect(spectator.service).toBeTruthy();
  });
});