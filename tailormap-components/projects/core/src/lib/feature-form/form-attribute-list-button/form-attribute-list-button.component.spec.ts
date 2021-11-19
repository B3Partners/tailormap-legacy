import { FormAttributeListButtonComponent } from './form-attribute-list-button.component';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { getTailorMapServiceMockProvider } from '../../../../../bridge/src/tailor-map.service.mock';
import { provideMockStore } from '@ngrx/store/testing';
import { getAttributeListServiceMockMockProvider } from '../../shared/tests/test-mocks';
import { SharedModule } from '@tailormap/shared';
import { APPLICATION_SERVICE } from '@tailormap/api';
import { createApplicationServiceMock } from '../../application/services/mocks/application.service.mock';

describe('FormAttributeListButtonComponent', () => {

  let spectator: Spectator<FormAttributeListButtonComponent>;
  const createComponent = createComponentFactory({
    component: FormAttributeListButtonComponent,
    imports: [ SharedModule ],
    providers: [
      provideMockStore(),
      getTailorMapServiceMockProvider(),
      getAttributeListServiceMockMockProvider(),
      { provide: APPLICATION_SERVICE, useValue: createApplicationServiceMock() },
    ],
  });

  beforeEach(async () => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

});
