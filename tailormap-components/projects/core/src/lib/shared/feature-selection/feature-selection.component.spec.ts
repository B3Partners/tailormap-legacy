import { Spectator, createComponentFactory, createSpyObject } from '@ngneat/spectator';

import { FeatureSelectionComponent, FeatureSelectionComponentData } from './feature-selection.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
    schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  });

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
