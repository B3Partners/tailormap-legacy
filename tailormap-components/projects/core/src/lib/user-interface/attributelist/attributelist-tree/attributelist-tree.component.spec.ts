import { AttributelistTreeComponent } from './attributelist-tree.component';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { SharedModule } from '../../../shared/shared.module';
import { getDialogRefMockProvider } from '../../../shared/tests/test-mocks';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TreeDialogData } from './attributelist-tree-models';
import { getAttributelistServiceMockProvider } from '../attributelist.service.mock';

describe('AttributelistTreeComponent', () => {
  let spectator: Spectator<AttributelistTreeComponent>;
  const dialogData: TreeDialogData = {
    rowsChecked: 0,
    tree: [
      {
        name: 'node-1',
        numberOfFeatures: 0,
        params: {} as any,
        isChild: true,
        features: [],
      }
    ],
  };
  const createComponent = createComponentFactory({
    component: AttributelistTreeComponent,
    imports: [ SharedModule ],
    providers: [
      getDialogRefMockProvider(),
      { provide: MAT_DIALOG_DATA, useValue: dialogData },
      getAttributelistServiceMockProvider(),
    ]
  });
  beforeEach(() => {
    spectator = createComponent();
  })
  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
