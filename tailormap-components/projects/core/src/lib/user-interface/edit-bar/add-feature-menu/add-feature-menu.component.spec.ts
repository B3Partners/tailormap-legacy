import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFeatureMenuComponent } from './add-feature-menu.component';
import { createComponentFactory, createSpyObject, Spectator } from '@ngneat/spectator';
import { getDialogRefMockProvider } from '../../../shared/tests/test-mocks';
import { getTailorMapServiceMockProvider } from '../../../../../../bridge/src/tailor-map.service.mock';
import { WorkflowControllerService } from '../../../workflow/workflow-controller/workflow-controller.service';
import { FormConfigMockModule } from '../../../shared/formconfig-repository/formconfig-mock.module.spec';
import { SharedModule } from '../../../shared/shared.module';
import { MenuButtonComponent } from './menu-button/menu-button.component';
import { formStateKey, initialFormState } from '../../../feature-form/state/form.state';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { applicationStateKey, initialApplicationState } from '../../../application/state/application.state';
import { MatIconTestingModule } from '@angular/material/icon/testing';

describe('AddFeatureMenuComponent', () => {
  let spectator: Spectator<AddFeatureMenuComponent>;
  const initialState = {
    [formStateKey]: initialFormState,
    [applicationStateKey]: initialApplicationState,
  };
  let store: MockStore;
  const createComponent = createComponentFactory({
    component: AddFeatureMenuComponent,
    imports: [
      SharedModule,
      FormConfigMockModule,
      MatIconTestingModule,
    ],
    declarations: [
      MenuButtonComponent,
    ],
    providers: [
      provideMockStore({ initialState }),
      getDialogRefMockProvider(),
      getTailorMapServiceMockProvider(),
      { provide: WorkflowControllerService, useValue: createSpyObject(WorkflowControllerService) },
    ],
  });

  beforeEach((() => {
    spectator = createComponent();
    store = spectator.inject(MockStore);
  }));

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
