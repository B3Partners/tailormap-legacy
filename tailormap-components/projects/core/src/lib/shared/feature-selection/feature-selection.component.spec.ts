import { Spectator, createComponentFactory, createSpyObject } from '@ngneat/spectator';

import { FeatureSelectionComponent, FeatureSelectionComponentData } from './feature-selection.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SharedModule } from '../shared.module';

describe('FeatureSelectionComponent', () => {
  let spectator: Spectator<FeatureSelectionComponent>;

  const dialogData: FeatureSelectionComponentData = {
    formConfigs: new Map(),
    features: [],
  };

  const createComponent = createComponentFactory({
    component: FeatureSelectionComponent,
    imports: [ SharedModule ],
    providers: [
      { provide: MAT_DIALOG_DATA, useValue: dialogData },
      { provide: MatDialogRef, useValue: createSpyObject(MatDialogRef) },
    ],
  });

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
