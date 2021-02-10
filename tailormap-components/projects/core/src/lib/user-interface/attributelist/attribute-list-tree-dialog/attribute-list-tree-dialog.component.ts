import { Component, Inject } from '@angular/core';
import { OVERLAY_DATA } from '../../../shared/overlay-service/overlay.service';

@Component({
  selector: 'tailormap-attribute-list-tree-dialog',
  templateUrl: './attribute-list-tree-dialog.component.html',
  styleUrls: ['./attribute-list-tree-dialog.component.css'],
})
export class AttributeListTreeDialogComponent {

  constructor(
    @Inject(OVERLAY_DATA) public data: ({ layerId: string }),
  ) { }

}
