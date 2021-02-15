import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { AttributeListDataService } from './attribute-list-data.service';
import { FormConfigMockModule } from '../../../shared/formconfig-repository/formconfig-mock.module.spec';
import { getMetadataServiceMockProvider } from '../../../application/services/mocks/metadata.service.mock';
import { getApplicationServiceMockProvider } from '../../../application/services/mocks/application.service.mock';
import { getAttributeServiceMockProvider } from '../../../shared/attribute-service/mocks/attribute.service.mock';
import { attributeListStateKey, initialAttributeListState } from '../state/attribute-list.state';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

describe('AttributeListDataService', () => {

  let spectator: SpectatorService<AttributeListDataService>;
  const initialState = { [attributeListStateKey]: initialAttributeListState };
  let store: MockStore;

  const createService = createServiceFactory({
    service: AttributeListDataService,
    imports: [ FormConfigMockModule ],
    providers: [
      provideMockStore({ initialState }),
      getAttributeServiceMockProvider(),
      getApplicationServiceMockProvider(),
      getMetadataServiceMockProvider(),
    ]
  });

  beforeEach(() => {
    spectator = createService();
    store = spectator.inject(MockStore);
  });

  it('should...', () => {
    expect(spectator.service).toBeTruthy();
  });
});
