import { ChooseTypesComponent } from './choose-types.component';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { SharedModule } from '../../../shared/shared.module';
import { getDialogRefMockProvider } from '../../../shared/tests/test-mocks';
import { ChooseDialogData } from '../../../workflow/workflows/WorkflowModels';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

describe('ChooseTypesComponent', () => {
  let spectator: Spectator<ChooseTypesComponent>;
  const dialogData: ChooseDialogData = { featureType: '1' };
  const createComponent = createComponentFactory({
    component: ChooseTypesComponent,
    imports: [ SharedModule ],
    providers: [
      getDialogRefMockProvider(),
      { provide: MAT_DIALOG_DATA, useValue: dialogData },
    ],
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
