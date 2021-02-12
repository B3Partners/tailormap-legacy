import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { AttributeListDataService } from './attribute-list-data.service';
import { FormConfigMockModule } from '../../../shared/formconfig-repository/formconfig-mock.module.spec';
import { getMetadataServiceMockProvider } from '../../../application/services/mocks/metadata.service.mock';
import { getApplicationServiceMockProvider } from '../../../application/services/mocks/application.service.mock';
import { getAttributeServiceMockProvider } from '../../../shared/attribute-service/mocks/attribute.service.mock';

describe('AttributeListDataService', () => {
  let spectator: SpectatorService<AttributeListDataService>;
  const createService = createServiceFactory({
    service: AttributeListDataService,
    imports: [ FormConfigMockModule ],
    providers: [
      getAttributeServiceMockProvider(),
      getApplicationServiceMockProvider(),
      getMetadataServiceMockProvider(),
    ]
  });

  beforeEach(() => spectator = createService());

  it('should...', () => {
    expect(spectator.service).toBeTruthy();
  });
});
