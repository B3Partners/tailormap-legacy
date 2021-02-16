import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { AttributeListManagerService } from './attribute-list-manager.service';
import { attributeListStateKey, initialAttributeListState } from '../state/attribute-list.state';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { getMetadataServiceMockProvider } from '../../../application/services/mocks/metadata.service.mock';
import { IdService } from '../../../shared/id-service/id.service';
import { FormConfigMockModule } from '../../../shared/formconfig-repository/formconfig-mock.module.spec';
import { applicationStateKey, initialApplicationState } from '../../../application/state/application.state';
import { formStateKey, initialFormState } from '../../../feature-form/state/form.state';

describe('AttributeListManagerService', () => {

  let spectator: SpectatorService<AttributeListManagerService>;
  const initialState = {
    [attributeListStateKey]: initialAttributeListState,
    [applicationStateKey]: initialApplicationState,
    [formStateKey]: initialFormState,
  };
  let store: MockStore;

  const createService = createServiceFactory({
    service: AttributeListManagerService,
    imports: [ FormConfigMockModule ],
    providers: [
      provideMockStore({ initialState }),
      getMetadataServiceMockProvider(),
      IdService,
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
