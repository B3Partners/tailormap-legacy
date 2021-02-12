import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { AttributeListTreeDialogComponent } from './attribute-list-tree-dialog.component';
import { OVERLAY_DATA } from '../../../shared/overlay-service/overlay.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('AttributeListTreeDialogComponent', () => {
  let spectator: Spectator<AttributeListTreeDialogComponent>;
  const createComponent = createComponentFactory({
    component: AttributeListTreeDialogComponent,
    providers: [
      { provide: OVERLAY_DATA, useValue: { layerId: "1" }},
    ],
    schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  });

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
