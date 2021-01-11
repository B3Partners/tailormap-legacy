import { AttributeSelectorComponent } from './attribute-selector.component';
import { SharedModule } from '../../shared/shared.module';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { getMetadataServiceMockProvider } from '../../application/services/mocks/metadata.service.mock';

describe('AttributeSelectorComponent', () => {

    let spectator: Spectator<AttributeSelectorComponent>;

    const createComponent = createComponentFactory({
      component: AttributeSelectorComponent,
      imports: [ SharedModule ],
      providers: [
        getMetadataServiceMockProvider(),
      ]
    });

    beforeEach(() => {
      spectator = createComponent();
    });

    it('should create', () => {
      expect(spectator).toBeTruthy();
    });

});
