import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFeatureMenuComponent } from './add-feature-menu.component';
import { createComponentFactory, createSpyObject, Spectator } from '@ngneat/spectator';
import { getDialogRefMockProvider } from '../../../shared/tests/test-mocks';
import { getTailorMapServiceMockProvider } from '../../../../../../bridge/src/tailor-map.service.mock';
import { WorkflowControllerService } from '../../../workflow/workflow-controller/workflow-controller.service';
import { FormConfigMockModule } from '../../../shared/formconfig-repository/formconfig-mock.module.spec';
import { SharedModule } from '../../../shared/shared.module';
import { MenuButtonComponent } from './menu-button/menu-button.component';

describe('AddFeatureMenuComponent', () => {
  let spectator: Spectator<AddFeatureMenuComponent>;
  const createComponent = createComponentFactory({
    component: AddFeatureMenuComponent,
    imports: [
      SharedModule,
      FormConfigMockModule,
    ],
    declarations: [
      MenuButtonComponent,
    ],
    providers: [
      getDialogRefMockProvider(),
      getTailorMapServiceMockProvider(),
      { provide: WorkflowControllerService, useValue: createSpyObject(WorkflowControllerService) },
    ]
  });

  beforeEach((() => {
    spectator = createComponent();
  }));

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
