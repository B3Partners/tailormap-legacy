import { CriteriaComponent } from './criteria.component';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { analysisStateKey, initialAnalysisState } from '../../state/analysis.state';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { SharedModule } from '../../../shared/shared.module';
import { getMetadataServiceMockProvider } from '../../../application/services/mocks/metadata.service.mock';
import { selectSelectedDataSource } from '../../state/analysis.selectors';
import { AttributeTypeEnum } from '../../../shared/models/attribute-type.enum';
import { AttributeSelectorComponent } from '../../attribute-selector/attribute-selector.component';
import { AttributeFilterComponent } from '../../../shared/attribute-filter/attribute-filter.component';

describe('CriteriaComponent', () => {
  let spectator: Spectator<CriteriaComponent>;
  const initialState = { [analysisStateKey]: initialAnalysisState };
  let store: MockStore;

  const createComponent = createComponentFactory({
    component: CriteriaComponent,
    declarations: [ AttributeSelectorComponent, AttributeFilterComponent ],
    imports: [ SharedModule ],
    providers: [
      provideMockStore({ initialState }),
      getMetadataServiceMockProvider(),
    ],
  });

  beforeEach(() => {
    spectator = createComponent();
    store = spectator.inject(MockStore);
    store.overrideSelector(selectSelectedDataSource, {
      layerId: 1,
      featureType: 1,
      label: 'Laag',
      geometryAttribute: '',
      geometryType: AttributeTypeEnum.GEOMETRY,
    });
  });

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
