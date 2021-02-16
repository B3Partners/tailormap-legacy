import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { AttributeListExportService } from './attribute-list-export.service';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { attributeListStateKey, initialAttributeListState } from '../state/attribute-list.state';
import { getTailorMapServiceMockProvider } from '../../../../../../bridge/src/tailor-map.service.mock';
import { getExportServiceMockProvider } from '../../../shared/export-service/mock/export.service.mock';
import { SharedModule } from '../../../shared/shared.module';

describe('AttributeListExportService', () => {

  let spectator: SpectatorService<AttributeListExportService>;
  const initialState = { [attributeListStateKey]: initialAttributeListState };
  let store: MockStore;

  const createService = createServiceFactory({
    service: AttributeListExportService,
    imports: [ SharedModule ],
    providers: [
      provideMockStore({ initialState }),
      getTailorMapServiceMockProvider(),
      getExportServiceMockProvider(),
    ],
  });

  beforeEach(() => {
    spectator = createService();
    store = spectator.inject(MockStore);
  });

  it('should...', () => {
    expect(spectator.service).toBeTruthy();
  });
});
