import { AnalysisAttributeListButtonComponent } from './analysis-attribute-list-button.component';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { getTailorMapServiceMockProvider } from '../../../../../bridge/src/tailor-map.service.mock';
import { provideMockStore } from '@ngrx/store/testing';
import { getAttributeListServiceMockMockProvider } from '../../shared/tests/test-mocks';
import { SharedModule } from '../../shared/shared.module';
import { getUserLayerServiceMockProvider } from '../services/mocks/user-layer.service.mock';
import { getMetadataServiceMockProvider } from '../../application/services/mocks/metadata.service.mock';

describe('AnalysisAttributeListButtonComponent', () => {

  let spectator: Spectator<AnalysisAttributeListButtonComponent>;
  const createComponent = createComponentFactory({
    component: AnalysisAttributeListButtonComponent,
    providers: [
      provideMockStore(),
      getTailorMapServiceMockProvider(),
      getAttributeListServiceMockMockProvider(),
      getUserLayerServiceMockProvider(),
      getMetadataServiceMockProvider(),
    ],
    imports: [
      SharedModule,
    ],
  });

  beforeEach(async () => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

});
