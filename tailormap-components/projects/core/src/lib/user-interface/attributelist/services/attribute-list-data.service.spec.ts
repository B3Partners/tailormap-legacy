import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { AttributeListDataService } from './attribute-list-data.service';

describe('AttributeListDataService', () => {
  let spectator: SpectatorService<AttributeListDataService>;
  const createService = createServiceFactory(AttributeListDataService);

  beforeEach(() => spectator = createService());

  it('should...', () => {
    expect(spectator.service).toBeTruthy();
  });
});