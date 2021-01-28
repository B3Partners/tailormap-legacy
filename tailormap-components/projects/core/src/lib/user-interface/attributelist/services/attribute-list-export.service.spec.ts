import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { AttributeListExportService } from './attribute-list-export.service';

describe('AttributeListExportService', () => {
  let spectator: SpectatorService<AttributeListExportService>;
  const createService = createServiceFactory(AttributeListExportService);

  beforeEach(() => spectator = createService());

  it('should...', () => {
    expect(spectator.service).toBeTruthy();
  });
});