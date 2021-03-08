import { createServiceFactory, createSpyObject, SpectatorService } from '@ngneat/spectator';
import { EditFeatureGeometryService } from './edit-feature-geometry.service';
import { formStateKey, initialFormState } from '../state/form.state';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { getFeatureInitializerServiceMockProvider } from '../../shared/feature-initializer/feature-initializer.service.mock';
import { FeatureControllerService } from '../../shared/generated';
import { of } from 'rxjs';
import { GeometryConfirmService } from '../../user-interface/geometry-confirm-buttons/geometry-confirm.service';
import { getTailorMapServiceMockProvider } from '../../../../../bridge/src/tailor-map.service.mock';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('EditFeatureGeometryService', () => {

  let spectator: SpectatorService<EditFeatureGeometryService>;
  const initialState = {
    [formStateKey]: initialFormState,
  };
  let store: MockStore;

  const featureControllerMockService = createSpyObject(FeatureControllerService, {
    save() {
      return of(null);
    },
  });

  const createService = createServiceFactory({
    service: EditFeatureGeometryService,
    imports: [
      MatSnackBarModule,
    ],
    providers: [
      provideMockStore({ initialState }),
      getFeatureInitializerServiceMockProvider(),
      { provide: FeatureControllerService, useValue: featureControllerMockService },
      { provide: GeometryConfirmService, useValue: createSpyObject(GeometryConfirmService) },
      getTailorMapServiceMockProvider(),
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
