import { EditBarComponent } from './edit-bar.component';
import { createComponentFactory, createSpyObject, Spectator } from '@ngneat/spectator';
import { SharedModule } from '../../../shared/shared.module';
import { getTailorMapServiceMockProvider } from '../../../../../../bridge/src/tailor-map.service.mock';
import { WorkflowControllerService } from '../../../workflow/workflow-controller/workflow-controller.service';
import { WorkflowActionManagerService } from '../../../workflow/workflow-controller/workflow-action-manager.service';
import { MenuButtonComponent } from '../add-feature-menu/menu-button/menu-button.component';

describe('EditBarComponent', () => {
  let spectator: Spectator<EditBarComponent>;
  const createComponent = createComponentFactory({
    component: EditBarComponent,
    declarations: [
      MenuButtonComponent,
    ],
    imports: [ SharedModule ],
    providers: [
      getTailorMapServiceMockProvider(),
      { provide: WorkflowControllerService, useValue: createSpyObject(WorkflowControllerService) },
      { provide: WorkflowActionManagerService, useValue: createSpyObject(WorkflowActionManagerService) },
    ]
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
